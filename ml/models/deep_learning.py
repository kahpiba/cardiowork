"""
PyTorch Deep Learning & Multimodal Fusion Architectures
CardioWork: Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)

Komponen:
1. TabularMcuEncoder: ResNet-style Tabular MLP untuk static MCU
2. TemporalDcuEncoder: GRU-D / Temporal Neural Network untuk deret waktu DCU
3. MultimodalCardioFusionNet: Late-fusion multimodal multi-task network + MC Dropout
4. CardioAutoencoder: Autoencoder Anomaly Detection untuk mendeteksi deviasi fisiologis
"""

import math
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple, List, Optional, Any


class TabularResBlock(nn.Module):
    """Blok Residual Tabular dengan BatchNorm, Dropout, dan GELU activation."""
    def __init__(self, dim: int, dropout_rate: float = 0.2):
        super().__init__()
        self.fc1 = nn.Linear(dim, dim)
        self.bn1 = nn.BatchNorm1d(dim)
        self.fc2 = nn.Linear(dim, dim)
        self.bn2 = nn.BatchNorm1d(dim)
        self.dropout = nn.Dropout(dropout_rate)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = self.dropout(F.gelu(self.bn1(self.fc1(x))))
        out = self.bn2(self.fc2(out))
        out = F.gelu(out + residual)
        return out


class TabularMcuEncoder(nn.Module):
    """
    Sub-model 3A: Enkoder Tabular MCU Statis.
    Memetakan fitur antropometri, profil lipid, glikemik, lab, dan riwayat menjadi vektor laten 64-d.
    """
    def __init__(self, in_features: int = 32, latent_dim: int = 64, dropout_rate: float = 0.2):
        super().__init__()
        self.in_proj = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Dropout(dropout_rate)
        )
        self.res_block1 = TabularResBlock(128, dropout_rate=dropout_rate)
        self.res_block2 = TabularResBlock(128, dropout_rate=dropout_rate)
        self.out_proj = nn.Sequential(
            nn.Linear(128, latent_dim),
            nn.BatchNorm1d(latent_dim),
            nn.GELU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.in_proj(x)
        h = self.res_block1(h)
        h = self.res_block2(h)
        return self.out_proj(h)


class TemporalDcuEncoder(nn.Module):
    """
    Sub-model 3B: Enkoder Deret Waktu DCU Harian (GRU-D).
    Memproses sekuens 30 hari pemantauan harian pre-shift (SBP, DBP, HR, SpO2, Temp, Sleep, Symptoms)
    menjadi vektor laten temporal 64-d.
    """
    def __init__(self, in_channels: int = 7, hidden_dim: int = 32, latent_dim: int = 64, dropout_rate: float = 0.2):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(in_channels, hidden_dim),
            nn.GELU()
        )
        self.gru = nn.GRU(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=2,
            batch_first=True,
            dropout=dropout_rate if dropout_rate > 0 else 0.0,
            bidirectional=True
        )
        # Bidirectional output size = hidden_dim * 2 (64)
        self.fc_pool = nn.Sequential(
            nn.Linear(hidden_dim * 2 * 2, latent_dim),
            nn.BatchNorm1d(latent_dim),
            nn.GELU()
        )

    def forward(self, x_seq: torch.Tensor) -> torch.Tensor:
        # x_seq: (B, T, in_channels)
        B, T, C = x_seq.shape
        proj = self.input_proj(x_seq) # (B, T, hidden_dim)
        gru_out, h_n = self.gru(proj) # gru_out: (B, T, 2*hidden_dim)

        # Temporal pooling: concatenate last step output + mean temporal pooling
        last_step = gru_out[:, -1, :] # (B, 2*hidden_dim)
        mean_step = torch.mean(gru_out, dim=1) # (B, 2*hidden_dim)
        pooled = torch.cat([last_step, mean_step], dim=-1) # (B, 4*hidden_dim)
        
        return self.fc_pool(pooled) # (B, latent_dim)


class MultimodalCardioFusionNet(nn.Module):
    """
    Sub-model 3C: Multimodal Late-Fusion Network.
    Menggabungkan vektor laten MCU (64-d) + DCU (64-d) untuk prediksi multi-target:
    - Target 1: Probabilitas CVD High Risk 10-Tahun (Binary)
    - Target 2: Probabilitas Unfit / Insiden Medevac 1-Tahun (Binary)
    - Target 3: Logits Klasifikasi Tingkat Risiko (4-class: Low, Moderate, High, Critical)
    """
    def __init__(
        self, 
        mcu_features: int = 32, 
        dcu_channels: int = 7,
        latent_dim: int = 64, 
        dropout_rate: float = 0.25
    ):
        super().__init__()
        self.mcu_encoder = TabularMcuEncoder(in_features=mcu_features, latent_dim=latent_dim, dropout_rate=dropout_rate)
        self.dcu_encoder = TemporalDcuEncoder(in_channels=dcu_channels, hidden_dim=32, latent_dim=latent_dim, dropout_rate=dropout_rate)

        fusion_dim = latent_dim * 2 # 128
        self.fusion_trunk = nn.Sequential(
            nn.Linear(fusion_dim, 96),
            nn.BatchNorm1d(96),
            nn.GELU(),
            nn.Dropout(dropout_rate),
            nn.Linear(96, 48),
            nn.BatchNorm1d(48),
            nn.GELU(),
            nn.Dropout(dropout_rate)
        )

        # Multi-task heads
        self.head_cvd = nn.Linear(48, 1)      # 10-Yr CVD High Risk
        self.head_unfit = nn.Linear(48, 1)    # 1-Yr Medevac/Unfit Incident
        self.head_tier = nn.Linear(48, 4)     # 4-Class Risk Tier

    def forward(
        self, 
        x_mcu: torch.Tensor, 
        x_dcu: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Forward pass multimodal.
        Returns:
            prob_cvd: (B, 1)
            prob_unfit: (B, 1)
            logits_tier: (B, 4)
        """
        h_mcu = self.mcu_encoder(x_mcu)
        h_dcu = self.dcu_encoder(x_dcu)

        h_fused = torch.cat([h_mcu, h_dcu], dim=-1)
        h_feat = self.fusion_trunk(h_fused)

        prob_cvd = torch.sigmoid(self.head_cvd(h_feat))
        prob_unfit = torch.sigmoid(self.head_unfit(h_feat))
        logits_tier = self.head_tier(h_feat)

        return prob_cvd, prob_unfit, logits_tier

    def predict_with_mc_dropout(
        self, 
        x_mcu: torch.Tensor, 
        x_dcu: torch.Tensor, 
        n_passes: int = 20
    ) -> Dict[str, Any]:
        """
        Estimasi Ketidakpastian Klinis menggunakan Monte Carlo Dropout.
        Menghasilkan mean probability dan predictive variance / standard deviation.
        """
        self.train() # Aktifkan dropout
        cvd_samples = []
        unfit_samples = []

        with torch.no_grad():
            for _ in range(n_passes):
                p_cvd, p_unfit, _ = self.forward(x_mcu, x_dcu)
                cvd_samples.append(p_cvd.cpu().numpy())
                unfit_samples.append(p_unfit.cpu().numpy())

        cvd_stack = np.stack(cvd_samples, axis=0) # (n_passes, B, 1)
        unfit_stack = np.stack(unfit_samples, axis=0)

        mean_cvd = np.mean(cvd_stack, axis=0)
        std_cvd = np.std(cvd_stack, axis=0)
        mean_unfit = np.mean(unfit_stack, axis=0)
        std_unfit = np.std(unfit_stack, axis=0)

        # 95% Credible Interval
        ci_lower_cvd = np.clip(mean_cvd - 1.96 * std_cvd, 0.0, 1.0)
        ci_upper_cvd = np.clip(mean_cvd + 1.96 * std_cvd, 0.0, 1.0)

        return {
            "mean_prob_cvd": mean_cvd,
            "std_prob_cvd": std_cvd,
            "ci_95_cvd": (ci_lower_cvd, ci_upper_cvd),
            "mean_prob_unfit": mean_unfit,
            "std_prob_unfit": std_unfit
        }


class CardioAutoencoder(nn.Module):
    """
    Sub-model 3D: Autoencoder Anomaly Detection.
    Mendeteksi anomali fisiologis out-of-distribution pada tanda vital & biomarker.
    """
    def __init__(self, in_dim: int = 20, latent_dim: int = 6):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(in_dim, 14),
            nn.BatchNorm1d(14),
            nn.LeakyReLU(0.2),
            nn.Linear(14, latent_dim),
            nn.LeakyReLU(0.2)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 14),
            nn.BatchNorm1d(14),
            nn.LeakyReLU(0.2),
            nn.Linear(14, in_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        z = self.encoder(x)
        x_recon = self.decoder(z)
        return x_recon

    def compute_anomaly_score(self, x: torch.Tensor) -> torch.Tensor:
        """Menghitung Mean Squared Error rekonsumsi per sampel."""
        x_recon = self.forward(x)
        recon_error = torch.mean((x - x_recon) ** 2, dim=-1)
        return recon_error
