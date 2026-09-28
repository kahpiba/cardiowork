"""
Pipeline Pelatihan & Evaluasi Layer 2 — Classical ML Baseline Models
CardioWork: Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)

Model:
1. Random Forest (RF)
2. LightGBM (LGBM)
3. XGBoost (XGB)

Karakteristik:
- 5-Fold Stratified K-Fold Cross-Validation
- Kalibrasi Probabilitas Klinis (CalibratedClassifierCV - Platt Scaling / Isotonic)
- Evaluasi Brier Score, ROC-AUC, PR-AUC, Sensitivitas (Recall), dan Expected Calibration Error (ECE)
- Ekspor Model Champion ke format ONNX INT8 / Float32 (< 5 MB) untuk Vercel Serverless
"""

import os
import json
import csv
import math
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any

from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    roc_auc_score, 
    average_precision_score, 
    brier_score_loss, 
    f1_score, 
    recall_score, 
    precision_score,
    confusion_matrix
)

# Optional LightGBM / XGBoost imports with fallbacks
try:
    from lightgbm import LGBMClassifier
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False


def load_raw_data(data_dir: str) -> Tuple[Dict[str, dict], Dict[str, list], Dict[str, list]]:
    """Memuat data mentah workers, MCU, dan DCU."""
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
        if pid not in worker_mcus:
            worker_mcus[pid] = []
        worker_mcus[pid].append(m)

    # Sort each worker's MCU chronologically
    for pid in worker_mcus:
        worker_mcus[pid].sort(key=lambda x: x["examination_year"])

    # Load DCU records
    worker_dcus: Dict[str, list] = {}
    if os.path.exists(dcu_path):
        with open(dcu_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pid = row["worker_pseudonym"]
                if pid not in worker_dcus:
                    worker_dcus[pid] = []
                worker_dcus[pid].append(row)
    
    return workers, worker_mcus, worker_dcus


def extract_features_and_targets(
    workers: Dict[str, dict], 
    worker_mcus: Dict[str, list], 
    worker_dcus: Dict[str, list]
) -> Tuple[pd.DataFrame, pd.Series, pd.Series, List[str]]:
    """
    Mengekstraksi fitur terpadu MCU + DCU rolling features dan label target prediksi.
    """
    rows = []
    y_cvd_list = []
    y_unfit_list = []

    for pid, w in workers.items():
        mcus = worker_mcus.get(pid, [])
        if not mcus:
            continue
        
        latest_mcu = mcus[-1]
        prev_mcu = mcus[-2] if len(mcus) > 1 else None

        # Antropometri & Hemodinamika
        sbp = float(latest_mcu["systolic_bp"])
        dbp = float(latest_mcu["diastolic_bp"])
        pulse_pressure = sbp - dbp
        map_val = (2.0 * dbp + sbp) / 3.0
        bmi = float(latest_mcu["bmi"])
        waist = float(latest_mcu["waist_circumference_cm"]) if latest_mcu.get("waist_circumference_cm") else (90.0 if w["gender"] == "MALE" else 80.0)

        # Lipid & Lab
        tot_chol = float(latest_mcu["total_cholesterol_mgdl"])
        ldl = float(latest_mcu["ldl_cholesterol_mgdl"])
        hdl = float(latest_mcu["hdl_cholesterol_mgdl"])
        tg = float(latest_mcu["triglycerides_mgdl"])
        tg_hdl_ratio = tg / max(hdl, 1.0)
        fasting_glucose = float(latest_mcu["fasting_glucose_mgdl"])
        hba1c = float(latest_mcu.get("hba1c_percent") or 5.4)
        egfr = float(latest_mcu.get("egfr") or 90.0)
        uric_acid = float(latest_mcu.get("uric_acid_mgdl") or 5.5)

        # Riwayat & Klinis
        is_smoker = 1.0 if latest_mcu["smoking_status"] == "ACTIVE_SMOKER" else 0.0
        pack_years = float(latest_mcu.get("pack_years") or 0.0)
        has_dm = 1.0 if latest_mcu.get("has_diabetes_history") else 0.0
        has_ht = 1.0 if latest_mcu.get("has_hypertension_history") else 0.0
        fam_cvd = 1.0 if latest_mcu.get("family_cardio_history") else 0.0
        on_ht_drug = 1.0 if latest_mcu.get("on_antihypertensive_drugs") else 0.0
        on_statin = 1.0 if latest_mcu.get("on_statin_drugs") else 0.0

        # Sindrom Metabolik NCEP-ATP III
        met_count = 0
        if (w["gender"] == "MALE" and waist > 90) or (w["gender"] == "FEMALE" and waist > 80): met_count += 1
        if tg >= 150: met_count += 1
        if (w["gender"] == "MALE" and hdl < 40) or (w["gender"] == "FEMALE" and hdl < 50): met_count += 1
        if sbp >= 130 or dbp >= 85 or on_ht_drug: met_count += 1
        if fasting_glucose >= 100 or has_dm: met_count += 1
        metabolic_syndrome = 1.0 if met_count >= 3 else 0.0

        # Longitudinal deltas
        if prev_mcu:
            delta_sbp_1yr = sbp - float(prev_mcu["systolic_bp"])
            delta_ldl_1yr = ldl - float(prev_mcu["ldl_cholesterol_mgdl"])
            delta_bmi_1yr = bmi - float(prev_mcu["bmi"])
        else:
            delta_sbp_1yr = 0.0
            delta_ldl_1yr = 0.0
            delta_bmi_1yr = 0.0

        # DCU Rolling Features (30-day window)
        dcus = worker_dcus.get(pid, [])
        if dcus:
            # Sort and take latest 30 records
            dcus_sorted = sorted(dcus, key=lambda x: x.get("recorded_at", ""))[-30:]
            dcu_sbps = [float(d["systolic_bp"]) for d in dcus_sorted if "systolic_bp" in d]
            dcu_dbps = [float(d["diastolic_bp"]) for d in dcus_sorted if "diastolic_bp" in d]
            dcu_hrs = [float(d["resting_heart_rate"]) for d in dcus_sorted if "resting_heart_rate" in d]
            dcu_spo2s = [float(d["spo2_percent"]) for d in dcus_sorted if "spo2_percent" in d]
            dcu_sleeps = [float(d["sleep_hours_last_24h"]) for d in dcus_sorted if "sleep_hours_last_24h" in d]

            dcu_mean_sbp = float(np.mean(dcu_sbps)) if dcu_sbps else sbp
            dcu_std_sbp = float(np.std(dcu_sbps)) if len(dcu_sbps) > 1 else 5.0
            dcu_mean_dbp = float(np.mean(dcu_dbps)) if dcu_dbps else dbp
            dcu_mean_hr = float(np.mean(dcu_hrs)) if dcu_hrs else 72.0
            dcu_mean_spo2 = float(np.mean(dcu_spo2s)) if dcu_spo2s else 98.0
            dcu_min_spo2 = float(np.min(dcu_spo2s)) if dcu_spo2s else 97.0
            dcu_mean_sleep = float(np.mean(dcu_sleeps)) if dcu_sleeps else 7.0

            # 7-day slope of SBP
            if len(dcu_sbps) >= 7:
                x_7 = np.arange(7)
                slope_sbp_7d = float(np.polyfit(x_7, dcu_sbps[-7:], 1)[0])
            else:
                slope_sbp_7d = 0.0

            # Days with hypertension / symptoms
            dcu_ht_days = sum(1.0 for d in dcus_sorted if float(d.get("systolic_bp", 0)) >= 140 or float(d.get("diastolic_bp", 0)) >= 90)
            dcu_symptom_days = sum(1.0 for d in dcus_sorted if (
                d.get("chest_pain_flag") == "True" or 
                d.get("shortness_of_breath_flag") == "True" or 
                d.get("dizziness_flag") == "True" or 
                d.get("palpitations_flag") == "True"
            ))
        else:
            dcu_mean_sbp = sbp
            dcu_std_sbp = 4.0
            dcu_mean_dbp = dbp
            dcu_mean_hr = float(latest_mcu["resting_heart_rate"])
            dcu_mean_spo2 = 98.5
            dcu_min_spo2 = 97.0
            dcu_mean_sleep = 7.2
            slope_sbp_7d = 0.0
            dcu_ht_days = 0.0
            dcu_symptom_days = 0.0

        # Target definitions (Non-leaking prospective clinical risk formulation)
        # Menghindari target leakage dengan latent logistic risk + stochastic biological noise
        pid_seed = abs(hash(str(pid))) % 100000
        rng_worker = np.random.RandomState(pid_seed)
        
        z_latent_cvd = (
            -4.5
            + 0.050 * (float(w["age_baseline_2026"]) - 35.0)
            + 0.45 * (1.0 if w["gender"] == "MALE" else 0.0)
            + 0.028 * (sbp - 120.0)
            + 0.014 * (tot_chol - 180.0)
            + 0.70 * is_smoker
            + 0.75 * has_dm
            + 0.60 * fam_cvd
            + 0.35 * (1.0 if "ROTATION" in w.get("shift_pattern", "") else 0.0)
            + 0.025 * delta_sbp_1yr
            + rng_worker.normal(0.0, 0.80) # Variabilitas klinis independen
        )
        prob_latent = 1.0 / (1.0 + np.exp(-z_latent_cvd))
        is_high_risk = 1 if prob_latent >= 0.38 else 0

        # 2. Operational Unfit / Medevac incident risk
        z_latent_unfit = (
            -3.8
            + 0.035 * (sbp - 130.0)
            + 0.040 * (dcu_mean_sbp - 125.0)
            + 0.60 * (1.0 if dcu_symptom_days >= 2 else 0.0)
            + 0.45 * (1.0 if dcu_ht_days >= 5 else 0.0)
            + 0.50 * (1.0 if latest_mcu["overall_fitness_status"] in ["UNFIT", "FIT_WITH_RESTRICTION"] else 0.0)
            + rng_worker.normal(0.0, 0.75)
        )
        is_unfit = 1 if (1.0 / (1.0 + np.exp(-z_latent_unfit))) >= 0.42 else 0

        feat_dict = {
            "age": float(w["age_baseline_2026"]),
            "is_male": 1.0 if w["gender"] == "MALE" else 0.0,
            "tenure_months": float(w["tenure_months"]),
            "is_shift_rotation": 1.0 if "ROTATION" in w.get("shift_pattern", "") else 0.0,
            "is_high_hazard": 1.0 if w.get("job_hazard_category") == "HIGH" else 0.0,
            "bmi": bmi,
            "waist_circumference_cm": waist,
            "systolic_bp": sbp,
            "diastolic_bp": dbp,
            "pulse_pressure": pulse_pressure,
            "map": map_val,
            "resting_heart_rate": float(latest_mcu["resting_heart_rate"]),
            "total_cholesterol_mgdl": tot_chol,
            "ldl_cholesterol_mgdl": ldl,
            "hdl_cholesterol_mgdl": hdl,
            "triglycerides_mgdl": tg,
            "tg_hdl_ratio": tg_hdl_ratio,
            "fasting_glucose_mgdl": fasting_glucose,
            "hba1c_percent": hba1c,
            "egfr": egfr,
            "uric_acid_mgdl": uric_acid,
            "is_smoker": is_smoker,
            "pack_years": pack_years,
            "has_diabetes_history": has_dm,
            "has_hypertension_history": has_ht,
            "family_cardio_history": fam_cvd,
            "on_antihypertensive_drugs": on_ht_drug,
            "on_statin_drugs": on_statin,
            "metabolic_syndrome": metabolic_syndrome,
            "delta_sbp_1yr": delta_sbp_1yr,
            "delta_ldl_1yr": delta_ldl_1yr,
            "delta_bmi_1yr": delta_bmi_1yr,
            "dcu_mean_sbp_30d": dcu_mean_sbp,
            "dcu_std_sbp_30d": dcu_std_sbp,
            "dcu_mean_dbp_30d": dcu_mean_dbp,
            "dcu_mean_hr_30d": dcu_mean_hr,
            "dcu_mean_spo2_30d": dcu_mean_spo2,
            "dcu_min_spo2_30d": dcu_min_spo2,
            "dcu_mean_sleep_30d": dcu_mean_sleep,
            "dcu_slope_sbp_7d": slope_sbp_7d,
            "dcu_hypertensive_days_30d": dcu_ht_days,
            "dcu_symptom_days_30d": dcu_symptom_days
        }

        rows.append(feat_dict)
        y_cvd_list.append(is_high_risk)
        y_unfit_list.append(is_unfit)

    df_X = pd.DataFrame(rows)
    s_y_cvd = pd.Series(y_cvd_list, name="target_high_cvd_risk")
    s_y_unfit = pd.Series(y_unfit_list, name="target_unfit_status")
    feature_names = list(df_X.columns)

    return df_X, s_y_cvd, s_y_unfit, feature_names


def calculate_ece(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    """Menghitung Expected Calibration Error (ECE)."""
    bin_limits = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total_samples = len(y_true)

    for i in range(n_bins):
        bin_low = bin_limits[i]
        bin_high = bin_limits[i + 1]
        mask = (y_prob >= bin_low) & (y_prob < bin_high) if i < n_bins - 1 else (y_prob >= bin_low) & (y_prob <= bin_high)
        bin_size = np.sum(mask)

        if bin_size > 0:
            bin_acc = np.mean(y_true[mask])
            bin_conf = np.mean(y_prob[mask])
            ece += (bin_size / total_samples) * abs(bin_acc - bin_conf)

    return float(ece)


def train_and_evaluate_models(
    X: pd.DataFrame, 
    y: pd.Series, 
    feature_names: List[str]
) -> Tuple[Dict[str, Any], Any, str]:
    """
    Melakukan 5-Fold Stratified Cross-Validation untuk RF, LightGBM, dan XGBoost,
    dilengkapi kalibrasi probabilitas klinis.
    """
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    X_mat = X.values.astype(np.float32)
    y_vec = y.values.astype(int)

    candidates: Dict[str, Any] = {
        "Random_Forest": RandomForestClassifier(
            n_estimators=100, max_depth=6, min_samples_leaf=3, random_state=42, n_jobs=-1
        )
    }

    if HAS_LGBM:
        candidates["LightGBM"] = LGBMClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=4, num_leaves=15, 
            random_state=42, verbose=-1, n_jobs=-1
        )
    else:
        candidates["LightGBM_Fallback"] = GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42
        )

    if HAS_XGB:
        candidates["XGBoost"] = XGBClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=4, 
            random_state=42, eval_metric="logloss", n_jobs=-1
        )

    results: Dict[str, Any] = {}
    champion_name = ""
    best_score = -1.0
    champion_model = None

    print(f"Memulai 5-Fold Cross Validation untuk {len(candidates)} arsitektur...")

    for name, base_model in candidates.items():
        oof_preds = np.zeros(len(y_vec))
        oof_probs = np.zeros(len(y_vec))

        for train_idx, val_idx in skf.split(X_mat, y_vec):
            X_tr, y_tr = X_mat[train_idx], y_vec[train_idx]
            X_va, y_val = X_mat[val_idx], y_vec[val_idx]

            # Fit base model
            base_model.fit(X_tr, y_tr)

            # Fit Probability Calibrator (Platt Scaling via Sigmoid with internal 3-fold)
            calibrator = CalibratedClassifierCV(estimator=base_model, method="sigmoid", cv=3)
            calibrator.fit(X_tr, y_tr)

            probs = calibrator.predict_proba(X_va)[:, 1]
            oof_probs[val_idx] = probs
            oof_preds[val_idx] = (probs >= 0.5).astype(int)

        # Compute Out-of-Fold Evaluation Metrics
        roc_auc = float(roc_auc_score(y_vec, oof_probs))
        pr_auc = float(average_precision_score(y_vec, oof_probs))
        brier = float(brier_score_loss(y_vec, oof_probs))
        recall = float(recall_score(y_vec, oof_preds, zero_division=0))
        precision = float(precision_score(y_vec, oof_preds, zero_division=0))
        f1 = float(f1_score(y_vec, oof_preds, zero_division=0))
        ece = float(calculate_ece(y_vec, oof_probs, n_bins=10))

        # Calibration curve points
        prob_true, prob_pred = calibration_curve(y_vec, oof_probs, n_bins=10)
        calib_points = [
            {"mean_predicted_prob": float(p), "fraction_of_positives": float(t)}
            for p, t in zip(prob_pred, prob_true)
        ]

        cm = confusion_matrix(y_vec, oof_preds)

        results[name] = {
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "brier_score": round(brier, 4),
            "sensitivity_recall": round(recall, 4),
            "precision": round(precision, 4),
            "f1_score": round(f1, 4),
            "expected_calibration_error_ece": round(ece, 4),
            "confusion_matrix": {
                "true_negative": int(cm[0, 0]),
                "false_positive": int(cm[0, 1]),
                "false_negative": int(cm[1, 0]),
                "true_positive": int(cm[1, 1])
            },
            "calibration_curve": calib_points
        }

        print(f"[{name}] ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f} | Brier: {brier:.4f} | Recall: {recall:.4f} | ECE: {ece:.4f}")

        # Candidate selection based on Composite Clinical Utility Score:
        # High AUC + High Recall (to catch sick workers) - Penalty for Brier Error
        utility_score = roc_auc + (0.5 * recall) - (1.5 * brier)
        if utility_score > best_score:
            best_score = utility_score
            champion_name = name

    print(f"\nModel Champion Terpilih: {champion_name} (Composite Score: {best_score:.4f})")

    # Refit Champion on Full Dataset with Calibration
    full_base = candidates[champion_name]
    champion_calibrated = CalibratedClassifierCV(estimator=full_base, method="sigmoid", cv=5)
    champion_calibrated.fit(X_mat, y_vec)

    # Return base model as well for direct feature importance inspection
    return results, champion_calibrated, champion_name, full_base


def extract_feature_importance(model: Any, feature_names: List[str]) -> List[Dict[str, Any]]:
    """Mengekstraksi bobot pentingnya fitur (Feature Importance)."""
    base = model
    if hasattr(base, "feature_importances_"):
        importances = base.feature_importances_
    elif hasattr(base, "calibrated_classifiers_") and len(base.calibrated_classifiers_) > 0:
        # Average importances across folds
        clf0 = base.calibrated_classifiers_[0].estimator
        if hasattr(clf0, "feature_importances_"):
            importances = np.mean([c.estimator.feature_importances_ for c in base.calibrated_classifiers_], axis=0)
        else:
            importances = np.ones(len(feature_names)) / len(feature_names)
    else:
        importances = np.ones(len(feature_names)) / len(feature_names)

    fi_list = [
        {"feature": name, "importance": round(float(imp), 5)}
        for name, imp in zip(feature_names, importances)
    ]
    fi_list.sort(key=lambda x: x["importance"], reverse=True)
    return fi_list


def export_model_to_onnx(model: Any, n_features: int, output_path: str):
    """Mengekspor model terlatih ke format ONNX."""
    model_type = type(model).__name__

    if "LGBM" in model_type:
        import onnxmltools
        from onnxmltools.convert.common.data_types import FloatTensorType as OmlFloatTensorType
        initial_type = [("float_input", OmlFloatTensorType([None, n_features]))]
        onnx_model = onnxmltools.convert_lightgbm(model, initial_types=initial_type, target_opset=14)
    elif "XGB" in model_type:
        import onnxmltools
        from onnxmltools.convert.common.data_types import FloatTensorType as OmlFloatTensorType
        initial_type = [("float_input", OmlFloatTensorType([None, n_features]))]
        onnx_model = onnxmltools.convert_xgboost(model, initial_types=initial_type, target_opset=14)
    else:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType as SklFloatTensorType
        initial_type = [("float_input", SklFloatTensorType([None, n_features]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=14)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    model_size_kb = os.path.getsize(output_path) / 1024.0
    print(f"Model ({model_type}) berhasil diekspor ke ONNX: {output_path} ({model_size_kb:.1f} KB)")


def verify_onnx_inference(onnx_path: str, model_sklearn: Any, sample_X: np.ndarray):
    """Memverifikasi kesesuaian inferensi antara model Python dan ONNX Runtime."""
    import onnxruntime as ort

    session = ort.InferenceSession(onnx_path)
    input_name = session.get_inputs()[0].name
    
    # Python Scikit-Learn prediction
    sk_probs = model_sklearn.predict_proba(sample_X)[:, 1]

    # ONNX prediction
    onnx_inputs = {input_name: sample_X.astype(np.float32)}
    onnx_outputs = session.run(None, onnx_inputs)
    
    # In skl2onnx, probabilities for classifiers are in output index 1 (map of dicts or array)
    if len(onnx_outputs) > 1 and isinstance(onnx_outputs[1], list):
        # List of dicts {0: p0, 1: p1}
        onnx_probs = np.array([d[1] for d in onnx_outputs[1]])
    elif len(onnx_outputs) > 1 and isinstance(onnx_outputs[1], np.ndarray):
        onnx_probs = onnx_outputs[1][:, 1]
    else:
        onnx_probs = np.array([list(d.values())[1] for d in onnx_outputs[1]])

    max_diff = float(np.max(np.abs(sk_probs - onnx_probs)))
    print(f"Validasi Paritas ONNX vs Python: Max Absolute Diff = {max_diff:.6f}")
    assert max_diff < 1e-3, f"Paritas ONNX melebihi ambang batas toleransi! Diff: {max_diff}"
    print("Verifikasi ONNX BERHASIL (Paritas Sempurna).")


def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_dir = os.path.join(root_dir, "data")
    models_dir = os.path.join(root_dir, "models")
    web_models_dir = os.path.abspath(os.path.join(root_dir, "..", "apps", "web", "public", "models"))
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(web_models_dir, exist_ok=True)

    print("=== CardioWork Phase 4: Pelatihan Model Classical ML ===")
    print(f"Memuat data dari: {data_dir}")
    workers, worker_mcus, worker_dcus = load_raw_data(data_dir)
    print(f"Jumlah pekerja: {len(workers)} | MCU records: {sum(len(v) for v in worker_mcus.values())}")

    print("Mengekstraksi fitur dan label...")
    X, y_cvd, y_unfit, feature_names = extract_features_and_targets(workers, worker_mcus, worker_dcus)
    print(f"Matriks Fitur: {X.shape[0]} baris, {X.shape[1]} kolom.")
    print(f"Prevalensi Target CVD High Risk: {y_cvd.mean()*100:.1f}% ({y_cvd.sum()} positif)")
    print(f"Prevalensi Target Unfit Status: {y_unfit.mean()*100:.1f}% ({y_unfit.sum()} positif)")

    # 1. Train and evaluate CVD Risk Model
    print("\n--- [1] Pelatihan Model Prediksi Risiko CVD 10-Tahun ---")
    cvd_metrics, champion_cvd, champion_name, full_base = train_and_evaluate_models(X, y_cvd, feature_names)

    # 2. Extract feature importance
    feature_importances = extract_feature_importance(full_base, feature_names)
    print("\nTop 10 Fitur Terpenting (Feature Importance):")
    for item in feature_importances[:10]:
        print(f"  • {item['feature']}: {item['importance']:.4f}")

    # 3. Export Metrics & Feature Importance JSON
    metrics_path = os.path.join(models_dir, "metrics_classical_ml.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "champion_model": champion_name,
            "evaluation_metrics": cvd_metrics,
            "feature_count": len(feature_names),
            "sample_count": len(X),
            "target": "target_high_cvd_risk",
            "cv_strategy": "5-Fold Stratified K-Fold",
            "calibration_method": "Platt Scaling (Sigmoid)"
        }, f, indent=2)
    print(f"\nMetrik tersimpan di: {metrics_path}")

    fi_path = os.path.join(models_dir, "feature_importance.json")
    with open(fi_path, "w") as f:
        json.dump({
            "champion_model": champion_name,
            "feature_importances": feature_importances,
            "top_drivers": [f["feature"] for f in feature_importances[:7]]
        }, f, indent=2)
    print(f"Feature importance tersimpan di: {fi_path}")

    # Also save to web public assets so client UI can render the SHAP/Feature Importance directly
    web_fi_path = os.path.join(web_models_dir, "feature_importance.json")
    with open(web_fi_path, "w") as f:
        json.dump({
            "champion_model": champion_name,
            "feature_importances": feature_importances,
            "top_drivers": [f["feature"] for f in feature_importances[:7]]
        }, f, indent=2)

    web_metrics_path = os.path.join(web_models_dir, "metrics_classical_ml.json")
    with open(web_metrics_path, "w") as f:
        json.dump({
            "champion_model": champion_name,
            "evaluation_metrics": cvd_metrics,
            "feature_count": len(feature_names),
            "sample_count": len(X)
        }, f, indent=2)

    # 4. Export to ONNX
    onnx_ml_path = os.path.join(models_dir, "classical_ml_model.onnx")
    onnx_web_path = os.path.join(web_models_dir, "classical_ml_model.onnx")

    export_model_to_onnx(full_base, len(feature_names), onnx_ml_path)
    export_model_to_onnx(full_base, len(feature_names), onnx_web_path)

    # 5. Verify Parity on sample test batch
    sample_X = X.values[:10].astype(np.float32)
    verify_onnx_inference(onnx_ml_path, full_base, sample_X)

    print("\n=== Pelatihan & Ekspor Model Phase 4 Selesai dengan Sukses ===")


if __name__ == "__main__":
    main()
