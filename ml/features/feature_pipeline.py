#!/usr/bin/env python3
"""
CardioWork — Python Feature Engineering Pipeline
Uses packages/shared/feature_spec.json as the Single Source of Truth.
"""

import json
import os
import math
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(BASE_DIR)
CARDIOWORK_DIR = os.path.dirname(ML_DIR)
SPEC_PATH = os.path.join(CARDIOWORK_DIR, "packages", "shared", "feature_spec.json")

def load_feature_spec():
    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

class CardioFeaturePipeline:
    def __init__(self, spec=None):
        self.spec = spec or load_feature_spec()
        self.mcu_spec = self.spec["mcu_features"]
        self.dcu_spec = self.spec["dcu_features"]

    def extract_mcu_features(self, mcu_record, prev_mcu_record=None):
        """
        Extract and transform baseline annual MCU record into engineered feature dict.
        """
        feats = {}
        
        # 1. Base Continuous Features with Imputation
        for key in ["age", "bmi", "systolic_bp", "diastolic_bp", "resting_heart_rate",
                    "fasting_glucose", "total_cholesterol", "hdl_cholesterol", 
                    "ldl_cholesterol", "triglycerides"]:
            val = mcu_record.get(key) or mcu_record.get(f"{key}_mgdl") or mcu_record.get(f"{key}_cm")
            if val is None or (isinstance(val, float) and math.isnan(val)):
                val = self.mcu_spec[key]["default_impute_value"]
            feats[key] = float(val)

        # 2. Categorical Encodings
        gender_raw = mcu_record.get("gender", "MALE").upper()
        feats["gender_code"] = self.mcu_spec["gender"]["encoding"].get(gender_raw, 1)
        
        smoking_raw = mcu_record.get("smoking_status", "NON_SMOKER").upper()
        feats["smoking_code"] = self.mcu_spec["smoking_status"]["encoding"].get(smoking_raw, 0)
        
        ecg_raw = mcu_record.get("resting_ecg_interpretation", mcu_record.get("resting_ecg", "NORMAL")).upper()
        feats["resting_ecg_code"] = self.mcu_spec["resting_ecg"]["encoding"].get(ecg_raw, 0)

        # 3. Derived Hemodynamic & Lipid Features
        sbp = feats["systolic_bp"]
        dbp = feats["diastolic_bp"]
        tot_chol = feats["total_cholesterol"]
        hdl = max(1.0, feats["hdl_cholesterol"])
        tg = feats["triglycerides"]
        bmi = feats["bmi"]
        glucose = feats["fasting_glucose"]

        feats["pulse_pressure"] = sbp - dbp
        feats["mean_arterial_pressure"] = round(dbp + (1.0 / 3.0) * (sbp - dbp), 2)
        feats["cholesterol_hdl_ratio"] = round(tot_chol / hdl, 2)
        feats["triglycerides_hdl_ratio"] = round(tg / hdl, 2)

        # 4. Asia-Pacific BMI Categories
        # Underweight (<18.5), Normal (18.5-22.9), Overweight (23.0-24.9), Obese I (25.0-29.9), Obese II (>=30.0)
        if bmi < 18.5:
            bmi_cat = 0
        elif bmi < 23.0:
            bmi_cat = 1
        elif bmi < 25.0:
            bmi_cat = 2
        elif bmi < 30.0:
            bmi_cat = 3
        else:
            bmi_cat = 4
        feats["bmi_category_asia_pacific"] = bmi_cat

        # 5. Metabolic Syndrome Criteria (IDF / NCEP ATP III Asia-Pacific)
        # Meets >= 3 criteria: BMI >= 25, TG >= 150, HDL < 40(M)/50(F), SBP >= 130 or DBP >= 85, Glucose >= 100
        mets_count = 0
        if bmi >= 25.0: mets_count += 1
        if tg >= 150.0: mets_count += 1
        if (feats["gender_code"] == 1 and hdl < 40.0) or (feats["gender_code"] == 0 and hdl < 50.0): mets_count += 1
        if sbp >= 130 or dbp >= 85: mets_count += 1
        if glucose >= 100.0: mets_count += 1
        feats["metabolic_syndrome_flag"] = 1 if mets_count >= 3 else 0

        # 6. Longitudinal Delta vs Previous Year
        if prev_mcu_record:
            prev_sbp = prev_mcu_record.get("systolic_bp", sbp)
            prev_bmi = prev_mcu_record.get("bmi", bmi)
            prev_ldl = prev_mcu_record.get("ldl_cholesterol_mgdl", prev_mcu_record.get("ldl_cholesterol", feats["ldl_cholesterol"]))
            feats["delta_sbp_vs_prev_year"] = round(sbp - prev_sbp, 1)
            feats["delta_bmi_vs_prev_year"] = round(bmi - prev_bmi, 2)
            feats["delta_ldl_vs_prev_year"] = round(feats["ldl_cholesterol"] - prev_ldl, 1)
        else:
            feats["delta_sbp_vs_prev_year"] = 0.0
            feats["delta_bmi_vs_prev_year"] = 0.0
            feats["delta_ldl_vs_prev_year"] = 0.0

        return feats

    def extract_dcu_window_features(self, dcu_history_list):
        """
        Compute rolling window metrics from recent DCU records (sorted chronologically).
        """
        feats = {}
        if not dcu_history_list:
            # Defaults if worker has no DCU logs yet
            return {
                "sbp_mean_7d": 120.0, "sbp_std_7d": 0.0, "sbp_slope_7d": 0.0,
                "sbp_mean_30d": 120.0, "sbp_std_30d": 0.0,
                "prop_hypertensive_days_30d": 0.0, "sleep_hours_mean_7d": 7.0,
                "complaints_count_30d": 0, "unfit_days_count_30d": 0
            }

        # Last 7, 14, 30 records
        last_7 = dcu_history_list[-7:]
        last_30 = dcu_history_list[-30:]

        # 7-Day SBP stats
        sbp_7 = [d["systolic_bp"] for d in last_7]
        feats["sbp_mean_7d"] = round(float(np.mean(sbp_7)), 2)
        feats["sbp_std_7d"] = round(float(np.std(sbp_7)), 2) if len(sbp_7) > 1 else 0.0
        
        # 7-Day SBP Slope (linear regression trend)
        if len(sbp_7) >= 3:
            x = np.arange(len(sbp_7))
            slope, _ = np.polyfit(x, sbp_7, 1)
            feats["sbp_slope_7d"] = round(float(slope), 3)
        else:
            feats["sbp_slope_7d"] = 0.0

        # 30-Day stats
        sbp_30 = [d["systolic_bp"] for d in last_30]
        feats["sbp_mean_30d"] = round(float(np.mean(sbp_30)), 2)
        feats["sbp_std_30d"] = round(float(np.std(sbp_30)), 2) if len(sbp_30) > 1 else 0.0

        # Proportion of Hypertensive Days (>= 140 or DBP >= 90)
        ht_days = sum(1 for d in last_30 if d["systolic_bp"] >= 140 or d["diastolic_bp"] >= 90)
        feats["prop_hypertensive_days_30d"] = round(ht_days / len(last_30), 3)

        # Sleep & Complaints
        sleep_7 = [d["sleep_hours_last_24h"] for d in last_7]
        feats["sleep_hours_mean_7d"] = round(float(np.mean(sleep_7)), 2)
        
        complaints = sum(1 for d in last_30 if d.get("chest_pain_flag") or d.get("shortness_of_breath_flag") or d.get("dizziness_flag"))
        feats["complaints_count_30d"] = complaints
        
        unfit = sum(1 for d in last_30 if d.get("daily_fitness_verdict") == "UNFIT")
        feats["unfit_days_count_30d"] = unfit

        return feats

    def scale_features(self, feature_dict):
        """
        Apply z-score standardization using feature_spec.json parameters.
        """
        scaled = {}
        for k, v in feature_dict.items():
            if k in self.mcu_spec and "scaling" in self.mcu_spec[k]:
                mean = self.mcu_spec[k]["scaling"]["mean"]
                std = self.mcu_spec[k]["scaling"]["std"]
                scaled[k] = round((v - mean) / std, 5)
            else:
                scaled[k] = v
        return scaled

if __name__ == "__main__":
    pipeline = CardioFeaturePipeline()
    sample_mcu = {
        "age": 45, "gender": "MALE", "bmi": 27.2, "systolic_bp": 146,
        "diastolic_bp": 92, "resting_heart_rate": 78, "fasting_glucose": 110,
        "total_cholesterol": 220, "hdl_cholesterol": 42, "ldl_cholesterol": 145,
        "triglycerides": 185, "smoking_status": "ACTIVE_SMOKER", "resting_ecg": "BORDERLINE"
    }
    sample_dcu = [
        {"systolic_bp": 142, "diastolic_bp": 90, "sleep_hours_last_24h": 5.5, "chest_pain_flag": False},
        {"systolic_bp": 148, "diastolic_bp": 94, "sleep_hours_last_24h": 4.5, "chest_pain_flag": False},
        {"systolic_bp": 152, "diastolic_bp": 96, "sleep_hours_last_24h": 4.0, "chest_pain_flag": True}
    ]
    mcu_feats = pipeline.extract_mcu_features(sample_mcu)
    dcu_feats = pipeline.extract_dcu_window_features(sample_dcu)
    scaled_feats = pipeline.scale_features(mcu_feats)
    
    print("✓ Python Feature Pipeline Self-Test:")
    print("MCU Features:", json.dumps(mcu_feats, indent=2))
    print("DCU Features:", json.dumps(dcu_feats, indent=2))
    print("Scaled SBP:", scaled_feats["systolic_bp"])
