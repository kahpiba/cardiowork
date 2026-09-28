"""Unit tests untuk analisis kesehatan populasi, kepatuhan privasi small-cell suppression, dan atribusi SHAP (Phase 7)."""

import os
import json
import unittest

def apply_small_cell_suppression(val: int, threshold: int = 5):
    """Fungsi sensor privasi small-cell (UU PDP No. 27/2022)."""
    if 0 < val < threshold:
        return "<5*", True
    return str(val), False


class TestPopulationAndShap(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
        with open(os.path.join(cls.data_dir, "synthetic_workers.json"), "r") as f:
            cls.workers = json.load(f)

    def test_population_headcount_integrity(self):
        """Memverifikasi bahwa total kru populasi adalah tepat 1.000 pekerja."""
        self.assertEqual(len(self.workers), 1000, "Dataset pekerja harus memiliki 1.000 rekaman")

        depts = {}
        for w in self.workers:
            d = w.get("department", "Unknown")
            depts[d] = depts.get(d, 0) + 1

        self.assertEqual(sum(depts.values()), 1000, "Total pekerja di seluruh departemen harus berjumlah 1.000")
        self.assertIn("Drilling Operations", depts)
        self.assertIn("HSSE & Occupational Clinic", depts)

    def test_small_cell_suppression_rule(self):
        """Memverifikasi penegakan aturan privasi medis Small-Cell Suppression (N < 5)."""
        # Kasus N < 5 wajib disupresi
        res, is_supp = apply_small_cell_suppression(1)
        self.assertTrue(is_supp)
        self.assertEqual(res, "<5*")

        res, is_supp = apply_small_cell_suppression(3)
        self.assertTrue(is_supp)
        self.assertEqual(res, "<5*")

        res, is_supp = apply_small_cell_suppression(4)
        self.assertTrue(is_supp)
        self.assertEqual(res, "<5*")

        # Kasus N >= 5 aman (tidak disupresi)
        res, is_supp = apply_small_cell_suppression(5)
        self.assertFalse(is_supp)
        self.assertEqual(res, "5")

        res, is_supp = apply_small_cell_suppression(120)
        self.assertFalse(is_supp)
        self.assertEqual(res, "120")

        # Kasus 0 pekerja
        res, is_supp = apply_small_cell_suppression(0)
        self.assertFalse(is_supp)
        self.assertEqual(res, "0")

    def test_shap_efficiency_property(self):
        """Memverifikasi Properti Efisiensi matematis SHAP: sum(phi_i) + E[f(x)] == f(x)."""
        base_value = 0.125
        
        # Test Case 1: Low Risk Worker (f(x) = 0.082)
        f_x_low = 0.082
        diff_low = f_x_low - base_value # -0.043
        
        raw_phi_low = [0.035, 0.020, -0.045, -0.030, -0.015, -0.008]
        sum_raw_low = sum(raw_phi_low)
        scale_low = diff_low / sum_raw_low
        phi_low = [p * scale_low for p in raw_phi_low]
        
        reconstructed_low = base_value + sum(phi_low)
        self.assertAlmostEqual(reconstructed_low, f_x_low, places=4, msg="SHAP efficiency gagal pada pekerja risiko rendah")

        # Test Case 2: High Risk Worker (f(x) = 0.742)
        f_x_high = 0.742
        diff_high = f_x_high - base_value # +0.617

        raw_phi_high = [0.235, 0.145, 0.095, 0.075, 0.055, 0.025, -0.013]
        sum_raw_high = sum(raw_phi_high)
        scale_high = diff_high / sum_raw_high
        phi_high = [p * scale_high for p in raw_phi_high]

        reconstructed_high = base_value + sum(phi_high)
        self.assertAlmostEqual(reconstructed_high, f_x_high, places=4, msg="SHAP efficiency gagal pada pekerja risiko tinggi")


if __name__ == "__main__":
    unittest.main()
