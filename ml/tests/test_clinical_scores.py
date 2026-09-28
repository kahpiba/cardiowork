#!/usr/bin/env python3
"""
Unit Tests for Layer 1 Clinical Scores against Golden Case Benchmarks.
"""

import unittest
from ml.features.clinical_scores import calculate_framingham_cvd, calculate_who_searo_cvd

class TestClinicalScores(unittest.TestCase):
    def test_framingham_low_risk_female(self):
        # 35yo female, non-smoker, non-diabetic, untreated SBP 110, Chol 160, HDL 55
        risk = calculate_framingham_cvd(
            age=35, gender="FEMALE", sbp=110, is_treated_bp=False,
            total_chol=160, hdl_chol=55, is_smoker=False, has_diabetes=False
        )
        self.assertLess(risk, 3.0, f"Expected low risk <3%, got {risk}%")

    def test_framingham_moderate_risk_male(self):
        # 55yo male, non-smoker, non-diabetic, untreated SBP 140, Chol 210, HDL 45
        risk = calculate_framingham_cvd(
            age=55, gender="MALE", sbp=140, is_treated_bp=False,
            total_chol=210, hdl_chol=45, is_smoker=False, has_diabetes=False
        )
        # Standard published Framingham 2008 tables give ~12-16% for this profile
        self.assertGreaterEqual(risk, 10.0)
        self.assertLessEqual(risk, 18.0)

    def test_framingham_high_risk_male(self):
        # 60yo male, smoker, diabetic, treated SBP 165, Chol 240, HDL 35
        risk = calculate_framingham_cvd(
            age=60, gender="MALE", sbp=165, is_treated_bp=True,
            total_chol=240, hdl_chol=35, is_smoker=True, has_diabetes=True
        )
        # Catastrophic multi-risk factor profile -> high risk >30%
        self.assertGreater(risk, 30.0)

    def test_who_searo_tiers(self):
        # Profile 1: Healthy young worker -> <10%
        tier1, _ = calculate_who_searo_cvd(age=32, gender="MALE", sbp=118, is_smoker=False, has_diabetes=False)
        self.assertEqual(tier1, "<10%")
        
        # Profile 2: Elderly smoker with severe hypertension -> >=40% or 30%-<40%
        tier2, _ = calculate_who_searo_cvd(age=64, gender="MALE", sbp=185, is_smoker=True, has_diabetes=True, total_chol=260)
        self.assertIn(tier2, ["30%-<40%", ">=40%"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
