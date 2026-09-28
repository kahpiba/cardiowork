#!/usr/bin/env python3
"""
Unit and Parity Tests for CardioWork Feature Engineering Pipeline
Compatible with standard library unittest and pytest for GitHub Actions CI.
"""

import json
import os
import unittest
import math
import numpy as np

from ml.features.feature_pipeline import CardioFeaturePipeline, load_feature_spec

class TestFeaturePipelineParity(unittest.TestCase):
    def setUp(self):
        self.spec = load_feature_spec()
        self.pipeline = CardioFeaturePipeline(self.spec)

    def test_feature_spec_structure(self):
        self.assertIn("mcu_features", self.spec)
        self.assertIn("dcu_features", self.spec)
        self.assertIn("derived_features", self.spec)
        self.assertIn("alert_thresholds", self.spec)
        self.assertEqual(self.spec["contract_version"], "1.0.0")

    def test_mcu_feature_extraction(self):
        sample_mcu = {
            "age": 42,
            "gender": "MALE",
            "bmi": 26.5,
            "systolic_bp": 138,
            "diastolic_bp": 88,
            "resting_heart_rate": 75,
            "fasting_glucose": 105.0,
            "total_cholesterol": 210.0,
            "hdl_cholesterol": 45.0,
            "ldl_cholesterol": 135.0,
            "triglycerides": 160.0,
            "smoking_status": "ACTIVE_SMOKER",
            "resting_ecg": "NORMAL"
        }
        
        feats = self.pipeline.extract_mcu_features(sample_mcu)
        
        # Pulse pressure: 138 - 88 = 50
        self.assertEqual(feats["pulse_pressure"], 50.0)
        # MAP: 88 + 1/3*(50) = 104.67
        self.assertAlmostEqual(feats["mean_arterial_pressure"], 104.67, places=1)
        # TG/HDL ratio: 160 / 45 = 3.56
        self.assertAlmostEqual(feats["triglycerides_hdl_ratio"], 3.56, places=1)
        # Metabolic syndrome: BMI >= 25, TG >= 150, Glucose >= 100, SBP >= 130 -> 4 criteria -> flag = 1
        self.assertEqual(feats["metabolic_syndrome_flag"], 1)
        # Encodings
        self.assertEqual(feats["gender_code"], 1)
        self.assertEqual(feats["smoking_code"], 2)
        self.assertEqual(feats["resting_ecg_code"], 0)

    def test_mcu_imputation(self):
        empty_mcu = {}
        feats = self.pipeline.extract_mcu_features(empty_mcu)
        
        self.assertEqual(feats["age"], 38.0)
        self.assertEqual(feats["systolic_bp"], 120.0)
        self.assertEqual(feats["diastolic_bp"], 80.0)
        self.assertEqual(feats["bmi"], 25.4)

    def test_dcu_window_features(self):
        dcu_logs = [
            {"systolic_bp": 120, "diastolic_bp": 80, "sleep_hours_last_24h": 7.0, "chest_pain_flag": False},
            {"systolic_bp": 130, "diastolic_bp": 84, "sleep_hours_last_24h": 6.5, "chest_pain_flag": False},
            {"systolic_bp": 140, "diastolic_bp": 90, "sleep_hours_last_24h": 5.0, "chest_pain_flag": True}
        ]
        
        dcu_feats = self.pipeline.extract_dcu_window_features(dcu_logs)
        
        self.assertEqual(dcu_feats["sbp_mean_7d"], 130.0)
        self.assertEqual(dcu_feats["complaints_count_30d"], 1)
        self.assertEqual(dcu_feats["sleep_hours_mean_7d"], 6.17)
        self.assertAlmostEqual(dcu_feats["prop_hypertensive_days_30d"], 0.333, places=2)

    def test_feature_scaling(self):
        sample_mcu = {"systolic_bp": 124.5}
        feats = self.pipeline.extract_mcu_features(sample_mcu)
        scaled = self.pipeline.scale_features(feats)
        
        # SBP mean in spec is 124.5 -> scaled value should be 0.0
        self.assertAlmostEqual(scaled["systolic_bp"], 0.0, places=3)

if __name__ == "__main__":
    unittest.main(verbosity=2)
