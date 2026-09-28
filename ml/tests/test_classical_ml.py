"""
Unit & Integration Tests untuk Layer 2 Classical Machine Learning
CardioWork: Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)
"""

import os
import json
import unittest
import numpy as np

class TestClassicalMLPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        cls.models_dir = os.path.join(cls.root_dir, "models")
        cls.web_models_dir = os.path.abspath(os.path.join(cls.root_dir, "..", "apps", "web", "public", "models"))
        cls.metrics_path = os.path.join(cls.models_dir, "metrics_classical_ml.json")
        cls.fi_path = os.path.join(cls.models_dir, "feature_importance.json")
        cls.onnx_path = os.path.join(cls.models_dir, "classical_ml_model.onnx")
        cls.web_onnx_path = os.path.join(cls.web_models_dir, "classical_ml_model.onnx")

    def test_01_metrics_file_exists_and_meets_clinical_thresholds(self):
        """Memverifikasi metrik evaluasi model memenuhi standar klinis."""
        self.assertTrue(os.path.exists(self.metrics_path), f"File metrik tidak ditemukan di {self.metrics_path}")
        
        with open(self.metrics_path, "r") as f:
            data = json.load(f)

        self.assertIn("champion_model", data)
        self.assertIn("evaluation_metrics", data)
        
        champion = data["champion_model"]
        metrics = data["evaluation_metrics"][champion]

        # Validasi batas klinis ketat
        self.assertGreaterEqual(metrics["roc_auc"], 0.80, f"ROC-AUC ({metrics['roc_auc']}) di bawah ambang batas 0.80")
        self.assertGreaterEqual(metrics["sensitivity_recall"], 0.75, f"Recall ({metrics['sensitivity_recall']}) di bawah 0.75")
        self.assertLessEqual(metrics["brier_score"], 0.20, f"Brier score ({metrics['brier_score']}) terlalu tinggi (> 0.20)")
        self.assertLessEqual(metrics["expected_calibration_error_ece"], 0.15, f"ECE ({metrics['expected_calibration_error_ece']}) terlalu tinggi")

    def test_02_feature_importance_validity(self):
        """Memverifikasi integritas atribusi fitur dan faktor risiko utama."""
        self.assertTrue(os.path.exists(self.fi_path), f"File feature importance tidak ditemukan di {self.fi_path}")

        with open(self.fi_path, "r") as f:
            data = json.load(f)

        self.assertIn("feature_importances", data)
        self.assertIn("top_drivers", data)
        self.assertGreaterEqual(len(data["feature_importances"]), 15)

        # Faktor risiko utama wajib mencakup parameter hemodinamik / lab kardiovaskular
        top_features = [item["feature"] for item in data["feature_importances"][:10]]
        key_cardio_features = ["systolic_bp", "pulse_pressure", "total_cholesterol_mgdl", "ldl_cholesterol_mgdl", "age", "bmi", "fasting_glucose_mgdl", "dcu_mean_sbp_30d"]
        has_overlap = any(feat in top_features for feat in key_cardio_features)
        self.assertTrue(has_overlap, "Top 10 fitur tidak mencakup parameter kardiovaskular kunci!")

    def test_03_onnx_model_file_size_and_location(self):
        """Memverifikasi model ONNX berhasil diekspor dan ukurannya memenuhi batas Vercel (< 15 MB)."""
        self.assertTrue(os.path.exists(self.onnx_path), f"Model ONNX tidak ditemukan di {self.onnx_path}")
        self.assertTrue(os.path.exists(self.web_onnx_path), f"Model ONNX web tidak ditemukan di {self.web_onnx_path}")

        size_kb = os.path.getsize(self.onnx_path) / 1024.0
        self.assertLess(size_kb, 15000, f"Ukuran model ONNX ({size_kb:.1f} KB) melampaui batas serverless 15 MB!")
        self.assertGreater(size_kb, 1, "Ukuran model ONNX kosong atau terlalu kecil!")

    def test_04_onnxruntime_inference_execution(self):
        """Memverifikasi model ONNX dapat diinferensikan menggunakan onnxruntime."""
        try:
            import onnxruntime as ort
        except ImportError:
            self.skipTest("onnxruntime belum terinstall di lingkungan pengujian saat ini.")

        session = ort.InferenceSession(self.onnx_path)
        input_meta = session.get_inputs()[0]
        n_features = input_meta.shape[1]

        # Generate synthetic input batch (2 samples)
        dummy_input = np.ones((2, n_features), dtype=np.float32)
        outputs = session.run(None, {input_meta.name: dummy_input})

        # Cek output label dan probabilitas
        self.assertGreaterEqual(len(outputs), 2, "Output ONNX harus memuat label dan probabilitas")
        labels = outputs[0]
        probs = outputs[1]
        self.assertEqual(len(labels), 2)


if __name__ == "__main__":
    unittest.main()
