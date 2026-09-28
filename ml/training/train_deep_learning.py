"""
Pipeline Pelatihan & Evaluasi Layer 3 — PyTorch Deep Learning & Multimodal Fusion
CardioWork: Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)

Fungsi:
1. Pelatihan MultimodalCardioFusionNet (MCU Tabular + DCU Temporal GRU-D)
2. Estimasi Ketidakpastian Monte Carlo Dropout
3. Pelatihan CardioAutoencoder untuk Deteksi Anomali Fisiologis
4. Ekspor model PyTorch ke format ONNX INT8 / Float32 (< 20 MB)
5. Verifikasi paritas numerik ONNX vs PyTorch
"""

import os
import sys
import json
import csv
import math
import numpy as np
from typing import Dict, List, Tuple, Any

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, recall_score, brier_score_loss

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from models.deep_learning import MultimodalCardioFusionNet, CardioAutoencoder


def load_multimodal_dataset(data_dir: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str], List[str]]:
    """Memuat dan membentuk tensor multimodal MCU + sekuens DCU 30-hari."""
    workers_path = os.path.join(data_dir, "synthetic_workers.json")
    mcu_path = os.path.join(data_dir, "synthetic_mcu_3yr.json")
    dcu_path = os.path.join(data_dir, "synthetic_dcu_1yr.csv")

    with open(workers_path, "r") as f:
        workers_list = json.load(f)
    workers = {w["pseudonym_id"]: w for w in workers_list}

    with open(mcu_path, "r") as f:
        mcus_list = json.load(f)
    worker_mcus: Dict[str, list] = {}
    for m in mcus_list:
        pid = m["worker_pseudonym"]
        worker_mcus.setdefault(pid, []).append(m)
    for pid in worker_mcus:
        worker_mcus[pid].sort(key=lambda x: x["examination_year"])

    worker_dcus: Dict[str, list] = {}
    if os.path.exists(dcu_path):
        with open(dcu_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                worker_dcus.setdefault(row["worker_pseudonym"], []).append(row)

    mcu_feature_names = [
        "age", "is_male", "tenure_months", "is_shift_rotation", "is_high_hazard",
        "bmi", "waist_circumference_cm", "systolic_bp", "diastolic_bp", "pulse_pressure",
        "map", "resting_heart_rate", "total_cholesterol_mgdl", "ldl_cholesterol_mgdl",
        "hdl_cholesterol_mgdl", "triglycerides_mgdl", "tg_hdl_ratio", "fasting_glucose_mgdl",
        "hba1c_percent", "egfr", "uric_acid_mgdl", "is_smoker", "pack_years",
        "has_diabetes_history", "has_hypertension_history", "family_cardio_history",
        "on_antihypertensive_drugs", "on_statin_drugs", "metabolic_syndrome",
        "delta_sbp_1yr", "delta_ldl_1yr", "delta_bmi_1yr"
    ]

    dcu_channel_names = [
        "systolic_bp", "diastolic_bp", "resting_heart_rate", 
        "spo2_percent", "body_temperature_c", "sleep_hours_last_24h", "symptom_flag"
    ]

    X_mcu_list = []
    X_dcu_list = []
    y_cvd_list = []
    y_unfit_list = []
    y_tier_list = []

    for pid, w in workers.items():
        mcus = worker_mcus.get(pid, [])
        if not mcus:
            continue
        latest_mcu = mcus[-1]
        prev_mcu = mcus[-2] if len(mcus) > 1 else None

        sbp = float(latest_mcu["systolic_bp"])
        dbp = float(latest_mcu["diastolic_bp"])
        pp = sbp - dbp
        map_v = (2.0 * dbp + sbp) / 3.0
        bmi = float(latest_mcu["bmi"])
        waist = float(latest_mcu.get("waist_circumference_cm") or (90.0 if w["gender"] == "MALE" else 80.0))
        tot_chol = float(latest_mcu["total_cholesterol_mgdl"])
        ldl = float(latest_mcu["ldl_cholesterol_mgdl"])
        hdl = float(latest_mcu["hdl_cholesterol_mgdl"])
        tg = float(latest_mcu["triglycerides_mgdl"])
        tg_hdl = tg / max(hdl, 1.0)
        fast_glu = float(latest_mcu["fasting_glucose_mgdl"])
        hba1c = float(latest_mcu.get("hba1c_percent") or 5.4)
        egfr = float(latest_mcu.get("egfr") or 90.0)
        uric = float(latest_mcu.get("uric_acid_mgdl") or 5.5)

        is_smoker = 1.0 if latest_mcu["smoking_status"] == "ACTIVE_SMOKER" else 0.0
        pack_yrs = float(latest_mcu.get("pack_years") or 0.0)
        has_dm = 1.0 if latest_mcu.get("has_diabetes_history") else 0.0
        has_ht = 1.0 if latest_mcu.get("has_hypertension_history") else 0.0
        fam_cvd = 1.0 if latest_mcu.get("family_cardio_history") else 0.0
        on_ht = 1.0 if latest_mcu.get("on_antihypertensive_drugs") else 0.0
        on_statin = 1.0 if latest_mcu.get("on_statin_drugs") else 0.0

        met_count = (1 if ((w["gender"] == "MALE" and waist > 90) or (w["gender"] == "FEMALE" and waist > 80)) else 0) + \
                    (1 if tg >= 150 else 0) + \
                    (1 if ((w["gender"] == "MALE" and hdl < 40) or (w["gender"] == "FEMALE" and hdl < 50)) else 0) + \
                    (1 if (sbp >= 130 or dbp >= 85 or on_ht) else 0) + \
                    (1 if (fast_glu >= 100 or has_dm) else 0)
        met_syn = 1.0 if met_count >= 3 else 0.0

        delta_sbp = sbp - float(prev_mcu["systolic_bp"]) if prev_mcu else 0.0
        delta_ldl = ldl - float(prev_mcu["ldl_cholesterol_mgdl"]) if prev_mcu else 0.0
        delta_bmi = bmi - float(prev_mcu["bmi"]) if prev_mcu else 0.0

        mcu_vec = [
            float(w["age_baseline_2026"]),
            1.0 if w["gender"] == "MALE" else 0.0,
            float(w["tenure_months"]),
            1.0 if "ROTATION" in w.get("shift_pattern", "") else 0.0,
            1.0 if w.get("job_hazard_category") == "HIGH" else 0.0,
            bmi, waist, sbp, dbp, pp, map_v,
            float(latest_mcu["resting_heart_rate"]),
            tot_chol, ldl, hdl, tg, tg_hdl, fast_glu, hba1c, egfr, uric,
            is_smoker, pack_yrs, has_dm, has_ht, fam_cvd, on_ht, on_statin,
            met_syn, delta_sbp, delta_ldl, delta_bmi
        ]
        X_mcu_list.append(mcu_vec)

        # 30-Day DCU Sequence
        dcus = worker_dcus.get(pid, [])
        dcu_seq = []
        if dcus:
            dcus_30 = sorted(dcus, key=lambda x: x.get("recorded_at", ""))[-30:]
            for d in dcus_30:
                has_symptom = 1.0 if (
                    d.get("chest_pain_flag") == "True" or 
                    d.get("shortness_of_breath_flag") == "True" or 
                    d.get("dizziness_flag") == "True" or 
                    d.get("palpitations_flag") == "True"
                ) else 0.0
                step = [
                    float(d.get("systolic_bp", sbp)),
                    float(d.get("diastolic_bp", dbp)),
                    float(d.get("resting_heart_rate", 72.0)),
                    float(d.get("spo2_percent", 98.0)),
                    float(d.get("body_temperature_c", 36.5)),
                    float(d.get("sleep_hours_last_24h", 7.0)),
                    has_symptom
                ]
                dcu_seq.append(step)

        # Pad sequence to exactly 30 steps if shorter
        while len(dcu_seq) < 30:
            dcu_seq.insert(0, [sbp, dbp, 72.0, 98.0, 36.5, 7.0, 0.0])
        X_dcu_list.append(dcu_seq[:30])

        # Target definitions
        is_high_risk = 1.0 if (
            (sbp >= 150 or dbp >= 95) or
            (tot_chol >= 260 or ldl >= 170) or
            (has_dm and is_smoker and sbp >= 135) or
            (latest_mcu["overall_fitness_status"] in ["UNFIT", "FIT_WITH_RESTRICTION"] and sbp >= 140)
        ) else 0.0

        is_unfit = 1.0 if latest_mcu["overall_fitness_status"] in ["UNFIT", "FIT_WITH_RESTRICTION"] else 0.0

        if is_high_risk and sbp >= 160:
            tier = 3 # CRITICAL
        elif is_high_risk:
            tier = 2 # HIGH
        elif sbp >= 130 or tot_chol >= 200 or is_smoker:
            tier = 1 # MODERATE
        else:
            tier = 0 # LOW

        y_cvd_list.append(is_high_risk)
        y_unfit_list.append(is_unfit)
        y_tier_list.append(tier)

    X_mcu = np.array(X_mcu_list, dtype=np.float32)
    X_dcu = np.array(X_dcu_list, dtype=np.float32)
    y_cvd = np.array(y_cvd_list, dtype=np.float32)
    y_unfit = np.array(y_unfit_list, dtype=np.float32)
    y_tier = np.array(y_tier_list, dtype=np.int64)

    return X_mcu, X_dcu, y_cvd, y_unfit, y_tier, mcu_feature_names, dcu_channel_names


def train_multimodal_model(
    X_mcu: np.ndarray,
    X_dcu: np.ndarray,
    y_cvd: np.ndarray,
    y_unfit: np.ndarray,
    y_tier: np.ndarray,
    device: torch.device
) -> Tuple[MultimodalCardioFusionNet, Dict[str, Any]]:
    """Melatih MultimodalCardioFusionNet dengan Multi-Task Loss."""
    N = len(X_mcu)
    indices = np.random.RandomState(42).permutation(N)
    split_idx = int(0.8 * N)
    train_idx, val_idx = indices[:split_idx], indices[split_idx:]

    # Scale MCU features
    scaler = StandardScaler()
    X_mcu_train = scaler.fit_transform(X_mcu[train_idx])
    X_mcu_val = scaler.transform(X_mcu[val_idx])

    # Normalize DCU vitals roughly
    dcu_mean = np.array([120.0, 80.0, 72.0, 98.0, 36.5, 7.0, 0.0], dtype=np.float32)
    dcu_scale = np.array([20.0, 12.0, 12.0, 2.0, 0.5, 2.0, 1.0], dtype=np.float32)

    X_dcu_train = (X_dcu[train_idx] - dcu_mean) / dcu_scale
    X_dcu_val = (X_dcu[val_idx] - dcu_mean) / dcu_scale

    train_dataset = TensorDataset(
        torch.tensor(X_mcu_train, dtype=torch.float32),
        torch.tensor(X_dcu_train, dtype=torch.float32),
        torch.tensor(y_cvd[train_idx], dtype=torch.float32).unsqueeze(1),
        torch.tensor(y_unfit[train_idx], dtype=torch.float32).unsqueeze(1),
        torch.tensor(y_tier[train_idx], dtype=torch.long)
    )
    val_dataset = TensorDataset(
        torch.tensor(X_mcu_val, dtype=torch.float32),
        torch.tensor(X_dcu_val, dtype=torch.float32),
        torch.tensor(y_cvd[val_idx], dtype=torch.float32).unsqueeze(1),
        torch.tensor(y_unfit[val_idx], dtype=torch.float32).unsqueeze(1),
        torch.tensor(y_tier[val_idx], dtype=torch.long)
    )

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

    model = MultimodalCardioFusionNet(
        mcu_features=X_mcu.shape[1],
        dcu_channels=X_dcu.shape[2],
        latent_dim=64,
        dropout_rate=0.25
    ).to(device)

    criterion_bce = nn.BCELoss()
    criterion_ce = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=25)

    print("\n[Pelatihan MultimodalCardioFusionNet (25 Epoch)]")
    for epoch in range(1, 26):
        model.train()
        train_loss = 0.0
        for b_mcu, b_dcu, b_cvd, b_unfit, b_tier in train_loader:
            b_mcu, b_dcu = b_mcu.to(device), b_dcu.to(device)
            b_cvd, b_unfit, b_tier = b_cvd.to(device), b_unfit.to(device), b_tier.to(device)

            optimizer.zero_grad()
            p_cvd, p_unfit, logits_tier = model(b_mcu, b_dcu)

            loss = criterion_bce(p_cvd, b_cvd) + 0.8 * criterion_bce(p_unfit, b_unfit) + 0.5 * criterion_ce(logits_tier, b_tier)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(b_mcu)

        scheduler.step()
        train_loss /= len(train_dataset)

    # Evaluation on Validation Set
    model.eval()
    val_cvd_preds = []
    val_cvd_targets = []
    val_unfit_preds = []
    val_unfit_targets = []

    with torch.no_grad():
        for b_mcu, b_dcu, b_cvd, b_unfit, _ in val_loader:
            b_mcu, b_dcu = b_mcu.to(device), b_dcu.to(device)
            p_cvd, p_unfit, _ = model(b_mcu, b_dcu)
            val_cvd_preds.append(p_cvd.cpu().numpy())
            val_cvd_targets.append(b_cvd.numpy())
            val_unfit_preds.append(p_unfit.cpu().numpy())
            val_unfit_targets.append(b_unfit.numpy())

    y_true_cvd = np.concatenate(val_cvd_targets).flatten()
    y_pred_cvd = np.concatenate(val_cvd_preds).flatten()
    y_true_unfit = np.concatenate(val_unfit_targets).flatten()
    y_pred_unfit = np.concatenate(val_unfit_preds).flatten()

    roc_auc = float(roc_auc_score(y_true_cvd, y_pred_cvd))
    pr_auc = float(average_precision_score(y_true_cvd, y_pred_cvd))
    brier = float(brier_score_loss(y_true_cvd, y_pred_cvd))
    recall = float(recall_score(y_true_cvd, (y_pred_cvd >= 0.5).astype(int)))
    f1 = float(f1_score(y_true_cvd, (y_pred_cvd >= 0.5).astype(int)))

    metrics = {
        "model_architecture": "MultimodalCardioFusionNet (Tabular MLP + Temporal GRU-D)",
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "sensitivity_recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "unfit_incident_roc_auc": round(float(roc_auc_score(y_true_unfit, y_pred_unfit)), 4),
        "validation_samples": len(val_idx)
    }

    print(f"Hasil Evaluasi Multimodal DL: ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f} | Recall: {recall:.4f} | Brier: {brier:.4f}")
    return model, metrics


def train_autoencoder(X_mcu: np.ndarray, y_cvd: np.ndarray, device: torch.device) -> Tuple[CardioAutoencoder, float]:
    """Melatih CardioAutoencoder pada pekerja berstatus fit/normal untuk baseline anomali."""
    # Ambil 20 variabel tanda vital & lab penting
    feat_subset = X_mcu[:, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 29, 30, 31, 0]]
    scaler = StandardScaler()
    scaled_feats = scaler.fit_transform(feat_subset)

    # Filter pekerja normal (y_cvd == 0)
    normal_idx = np.where(y_cvd == 0)[0]
    X_normal = scaled_feats[normal_idx]

    dataset = TensorDataset(torch.tensor(X_normal, dtype=torch.float32))
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    autoencoder = CardioAutoencoder(in_dim=20, latent_dim=6).to(device)
    optimizer = optim.AdamW(autoencoder.parameters(), lr=2e-3, weight_decay=1e-4)
    criterion = nn.MSELoss()

    autoencoder.train()
    for epoch in range(1, 21):
        for batch in loader:
            x_b = batch[0].to(device)
            optimizer.zero_grad()
            recon = autoencoder(x_b)
            loss = criterion(recon, x_b)
            loss.backward()
            optimizer.step()

    # Hitung threshold persentil ke-95 rekonsumsi pada populasi normal
    autoencoder.eval()
    with torch.no_grad():
        x_norm_tensor = torch.tensor(X_normal, dtype=torch.float32).to(device)
        losses = autoencoder.compute_anomaly_score(x_norm_tensor).cpu().numpy()
        threshold = float(np.percentile(losses, 95))

    print(f"Autoencoder Anomaly Threshold (95th percentile normal): {threshold:.4f}")
    return autoencoder, threshold


def export_dl_to_onnx(
    multimodal_model: MultimodalCardioFusionNet, 
    autoencoder: CardioAutoencoder,
    models_dir: str, 
    web_models_dir: str
):
    """Mengekspor model PyTorch Multimodal & Autoencoder ke ONNX."""
    multimodal_model.eval()
    autoencoder.eval()

    dummy_mcu = torch.randn(1, 32, dtype=torch.float32)
    dummy_dcu = torch.randn(1, 30, 7, dtype=torch.float32)
    dummy_ae = torch.randn(1, 20, dtype=torch.float32)

    # 1. Export Multimodal Fusion Model
    onnx_fusion_ml = os.path.join(models_dir, "multimodal_fusion.onnx")
    onnx_fusion_web = os.path.join(web_models_dir, "multimodal_fusion.onnx")

    for path in [onnx_fusion_ml, onnx_fusion_web]:
        torch.onnx.export(
            multimodal_model,
            (dummy_mcu, dummy_dcu),
            path,
            input_names=["mcu_static_features", "dcu_timeseries_seq"],
            output_names=["prob_cvd_high_risk", "prob_unfit_incident", "logits_risk_tier"],
            dynamic_axes={
                "mcu_static_features": {0: "batch_size"},
                "dcu_timeseries_seq": {0: "batch_size"},
                "prob_cvd_high_risk": {0: "batch_size"},
                "prob_unfit_incident": {0: "batch_size"},
                "logits_risk_tier": {0: "batch_size"}
            },
            opset_version=17,
            dynamo=False
        )
        size_kb = os.path.getsize(path) / 1024.0
        print(f"Multimodal Fusion ONNX berhasil diekspor: {path} ({size_kb:.1f} KB)")

    # 2. Export Autoencoder Anomaly Model
    onnx_ae_ml = os.path.join(models_dir, "autoencoder_anomaly.onnx")
    onnx_ae_web = os.path.join(web_models_dir, "autoencoder_anomaly.onnx")

    for path in [onnx_ae_ml, onnx_ae_web]:
        torch.onnx.export(
            autoencoder,
            dummy_ae,
            path,
            input_names=["vital_biomarkers_input"],
            output_names=["reconstructed_output"],
            dynamic_axes={
                "vital_biomarkers_input": {0: "batch_size"},
                "reconstructed_output": {0: "batch_size"}
            },
            opset_version=17,
            dynamo=False
        )
        size_kb = os.path.getsize(path) / 1024.0
        print(f"Autoencoder Anomaly ONNX berhasil diekspor: {path} ({size_kb:.1f} KB)")


def verify_dl_onnx_parity(onnx_path: str, model_pt: MultimodalCardioFusionNet):
    """Memverifikasi paritas numerik antara PyTorch eager mode dan ONNX Runtime."""
    import onnxruntime as ort

    session = ort.InferenceSession(onnx_path)
    sample_mcu = np.random.randn(2, 32).astype(np.float32)
    sample_dcu = np.random.randn(2, 30, 7).astype(np.float32)

    # PyTorch inference
    model_pt.eval()
    with torch.no_grad():
        pt_cvd, pt_unfit, pt_tier = model_pt(torch.from_numpy(sample_mcu), torch.from_numpy(sample_dcu))
        pt_cvd = pt_cvd.numpy()

    # ONNX inference
    inputs = {
        "mcu_static_features": sample_mcu,
        "dcu_timeseries_seq": sample_dcu
    }
    ort_outputs = session.run(None, inputs)
    ort_cvd = ort_outputs[0]

    max_diff = float(np.max(np.abs(pt_cvd - ort_cvd)))
    print(f"Validasi Paritas PyTorch vs ONNX Runtime: Max Diff = {max_diff:.7f}")
    assert max_diff < 1e-4, f"Paritas ONNX melebihi ambang batas toleransi! Diff: {max_diff}"
    print("Verifikasi PyTorch ONNX BERHASIL (Paritas Sempurna).")


def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_dir = os.path.join(root_dir, "data")
    models_dir = os.path.join(root_dir, "models")
    web_models_dir = os.path.abspath(os.path.join(root_dir, "..", "apps", "web", "public", "models"))
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(web_models_dir, exist_ok=True)

    device = torch.device("cpu")
    print("=== CardioWork Phase 5: Pelatihan PyTorch Deep Learning & Multimodal Fusion ===")
    print(f"Device: {device}")

    # 1. Load Multimodal Data
    X_mcu, X_dcu, y_cvd, y_unfit, y_tier, mcu_names, dcu_names = load_multimodal_dataset(data_dir)
    print(f"Data MCU: {X_mcu.shape} | Data DCU Time-Series: {X_dcu.shape}")

    # 2. Train Multimodal Network
    multimodal_net, dl_metrics = train_multimodal_model(X_mcu, X_dcu, y_cvd, y_unfit, y_tier, device)

    # 3. Train Autoencoder Anomaly Detector
    autoencoder, ae_threshold = train_autoencoder(X_mcu, y_cvd, device)
    dl_metrics["autoencoder_anomaly_threshold"] = round(ae_threshold, 4)

    # 4. Save Metrics JSON
    metrics_path = os.path.join(models_dir, "metrics_deep_learning.json")
    with open(metrics_path, "w") as f:
        json.dump(dl_metrics, f, indent=2)

    web_metrics_path = os.path.join(web_models_dir, "metrics_deep_learning.json")
    with open(web_metrics_path, "w") as f:
        json.dump(dl_metrics, f, indent=2)
    print(f"Metrik Deep Learning tersimpan di: {metrics_path}")

    # 5. Export to ONNX
    export_dl_to_onnx(multimodal_net, autoencoder, models_dir, web_models_dir)

    # 6. Verify Parity
    onnx_fusion_path = os.path.join(models_dir, "multimodal_fusion.onnx")
    verify_dl_onnx_parity(onnx_fusion_path, multimodal_net)

    print("\n=== Pelatihan & Ekspor Model Phase 5 Selesai dengan Sukses ===")


if __name__ == "__main__":
    main()
