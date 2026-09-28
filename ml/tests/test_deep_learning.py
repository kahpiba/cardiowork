"""
Unit & Integration Tests untuk Layer 3 PyTorch Deep Learning & Multimodal Fusion
CardioWork: Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)
"""

import os
import json
import unittest
import numpy as np
import torch

from ml.models.deep_learning import (
    TabularMcuEncoder, 
    TemporalDcuEncoder, 
    MultimodalCardioFusionNet, 
    CardioAutoencoder
)

class TestDeepLearningPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        cls.models_dir = os.path.join(cls.root_dir, "models")
        cls.web_models_dir = os.path.abspath(os.path.join(cls.root_dir, "..", "apps", "web", "public", "models"))
        cls.metrics_path = os.path.join(cls.models_dir, "metrics_deep_learning.json")
        cls.onnx_fusion_path = os.path.join(cls.models_dir, "multimodal_fusion.onnx")
        cls.onnx_ae_path = os.path.join(cls.models_dir, "autoencoder_anomaly.onnx")

    def test_01_tabular_mcu_encoder_forward(self):
        """Memverifikasi arsitektur ResNet-style Tabular MCU Encoder."""
        encoder = TabularMcuEncoder(in_features=32, latent_dim=64)
        dummy_x = torch.randn(4, 32)
        out = encoder(dummy_x)
        self.assertEqual(out.shape, (4, 64))

    def test_02_temporal_dcu_encoder_forward(self):
        """Memverifikasi arsitektur Bi-directional GRU-D Temporal Encoder."""
        encoder = TemporalDcuEncoder(in_channels=7, hidden_dim=32, latent_dim=64)
        dummy_seq = torch.randn(4, 30, 7) # 4 pekerja, 30 hari, 7 kanal vital
        out = encoder(dummy_seq)
        self.assertEqual(out.shape, (4, 64))

    def test_03_multimodal_fusion_forward_multitask(self):
        """Memverifikasi inferensi multi-task MultimodalCardioFusionNet."""
        net = MultimodalCardioFusionNet(mcu_features=32, dcu_channels=7, latent_dim=64)
        dummy_mcu = torch.randn(4, 32)
        dummy_dcu = torch.randn(4, 30, 7)

        p_cvd, p_unfit, logits_tier = net(dummy_mcu, dummy_dcu)

        self.assertEqual(p_cvd.shape, (4, 1))
        self.assertEqual(p_unfit.shape, (4, 1))
        self.assertEqual(logits_tier.shape, (4, 4))
        self.assertTrue((p_cvd >= 0.0).all() and (p_cvd <= 1.0).all())
        self.assertTrue((p_unfit >= 0.0).all() and (p_unfit <= 1.0).all())

    def test_04_mc_dropout_uncertainty_estimation(self):
        """Memverifikasi estimasi ketidakpastian klinis Monte Carlo Dropout."""
        net = MultimodalCardioFusionNet(mcu_features=32, dcu_channels=7, latent_dim=64)
        dummy_mcu = torch.randn(2, 32)
        dummy_dcu = torch.randn(2, 30, 7)

        mc_res = net.predict_with_mc_dropout(dummy_mcu, dummy_dcu, n_passes=10)
        self.assertIn("mean_prob_cvd", mc_res)
        self.assertIn("std_prob_cvd", mc_res)
        self.assertIn("ci_95_cvd", mc_res)
        self.assertEqual(mc_res["mean_prob_cvd"].shape, (2, 1))

    def test_05_autoencoder_anomaly_detection(self):
        """Memverifikasi kalkulasi error rekonstruksi CardioAutoencoder."""
        ae = CardioAutoencoder(in_dim=20, latent_dim=6)
        dummy_vitals = torch.randn(4, 20)
        recon = ae(dummy_vitals)
        self.assertEqual(recon.shape, (4, 20))

        scores = ae.compute_anomaly_score(dummy_vitals)
        self.assertEqual(scores.shape, (4,))
        self.assertTrue((scores >= 0.0).all())

    def test_06_onnx_models_validity_and_size(self):
        """Memverifikasi berkas ONNX Deep Learning ada dan ukurannya < 20 MB."""
        self.assertTrue(os.path.exists(self.onnx_fusion_path), "multimodal_fusion.onnx tidak ditemukan")
        self.assertTrue(os.path.exists(self.onnx_ae_path), "autoencoder_anomaly.onnx tidak ditemukan")

        fusion_kb = os.path.getsize(self.onnx_fusion_path) / 1024.0
        ae_kb = os.path.getsize(self.onnx_ae_path) / 1024.0

        self.assertLess(fusion_kb, 20000, f"Ukuran Multimodal ONNX ({fusion_kb:.1f} KB) melampaui 20 MB")
        self.assertLess(ae_kb, 5000, f"Ukuran Autoencoder ONNX ({ae_kb:.1f} KB) melampaui 5 MB")


if __name__ == "__main__":
    unittest.main()
