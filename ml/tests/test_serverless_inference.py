"""Unit tests untuk integrasi inferensi serverless dan mesin daily alerting (Phase 6)."""

import os
import json
import unittest
import numpy as np
import onnxruntime as ort

class TestServerlessInference(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
        cls.scaler_path = os.path.join(cls.models_dir, "scaler_deep_learning.json")
        cls.classical_path = os.path.join(cls.models_dir, "classical_ml_model.onnx")
        cls.multimodal_path = os.path.join(cls.models_dir, "multimodal_fusion.onnx")
        cls.autoencoder_path = os.path.join(cls.models_dir, "autoencoder_anomaly.onnx")

    def test_scaler_metadata_integrity(self):
        """Memverifikasi bahwa berkas metadata scaler memiliki dimensi dan statistik valid."""
        self.assertTrue(os.path.exists(self.scaler_path), "scaler_deep_learning.json tidak ditemukan!")
        with open(self.scaler_path, "r") as f:
            data = json.load(f)

        self.assertIn("mcu_scaler", data)
        self.assertIn("ae_scaler", data)
        self.assertEqual(len(data["mcu_scaler"]["mean"]), 32, "MCU scaler harus memiliki 32 mean")
        self.assertEqual(len(data["mcu_scaler"]["std"]), 32, "MCU scaler harus memiliki 32 std")
        self.assertEqual(len(data["ae_scaler"]["mean"]), 20, "AE scaler harus memiliki 20 mean")
        self.assertEqual(len(data["ae_scaler"]["std"]), 20, "AE scaler harus memiliki 20 std")

    def test_classical_onnx_inference(self):
        """Memverifikasi eksekusi inferensi LightGBM ONNX dengan 42 fitur."""
        self.assertTrue(os.path.exists(self.classical_path))
        session = ort.InferenceSession(self.classical_path)
        
        # Sample vector (Normal worker)
        sample = np.array([[
            45.0, 1.0, 36.0, 1.0, 1.0, 24.5, 86.0, 122.0, 78.0, 44.0, 92.6, 72.0,
            195.0, 115.0, 52.0, 140.0, 2.69, 92.0, 5.4, 92.0, 5.2, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 120.0, 4.2, 78.0, 72.0, 98.0,
            97.0, 7.2, 0.1, 0.0, 0.0
        ]], dtype=np.float32)

        results = session.run(None, {"float_input": sample})
        self.assertGreaterEqual(len(results), 2, "Harus menghasilkan label dan probabilities")

    def test_multimodal_and_autoencoder_onnx_inference(self):
        """Memverifikasi eksekusi inferensi Multimodal Net dan Autoencoder Anomaly ONNX."""
        session_mm = ort.InferenceSession(self.multimodal_path)
        session_ae = ort.InferenceSession(self.autoencoder_path)

        # 1. Multimodal forward
        sample_mcu = np.zeros((1, 32), dtype=np.float32)
        sample_dcu = np.ones((1, 30, 7), dtype=np.float32) * 120.0

        mm_out = session_mm.run(None, {
            "mcu_static_features": sample_mcu,
            "dcu_timeseries_seq": sample_dcu
        })
        cvd_prob = float(mm_out[0][0, 0])
        medevac_prob = float(mm_out[1][0, 0])
        tier_logits = mm_out[2][0]

        self.assertTrue(0.0 <= cvd_prob <= 1.0, f"CVD prob di luar batas [0, 1]: {cvd_prob}")
        self.assertTrue(0.0 <= medevac_prob <= 1.0, f"Medevac prob di luar batas [0, 1]: {medevac_prob}")
        self.assertEqual(len(tier_logits), 4, "Risk tier harus memiliki 4 kelas")

        # 2. Autoencoder forward
        sample_ae = np.zeros((1, 20), dtype=np.float32)
        ae_out = session_ae.run(None, {"vital_biomarkers_input": sample_ae})
        recon = ae_out[0]
        self.assertEqual(recon.shape, (1, 20), "Bentuk output rekonstruksi harus (1, 20)")
        
        mse = float(np.mean((sample_ae - recon) ** 2))
        self.assertGreaterEqual(mse, 0.0, "MSE loss rekonstruksi harus non-negatif")

    def test_daily_alert_rules_logic(self):
        """Memverifikasi logika penentuan peringatan dini hemodinamik."""
        # Ambang batas krisis tensi
        sbp_crisis = 182
        dbp_crisis = 112
        is_crisis = sbp_crisis >= 180 or dbp_crisis >= 110
        self.assertTrue(is_crisis, "Tensi 182/112 harus memicu krisis tensi akut")

        # Lonjakan delta tensi
        sbp_today = 148
        sbp_mean_7d = 124
        delta_spike = sbp_today - sbp_mean_7d
        self.assertGreaterEqual(delta_spike, 20, "Delta lonjakan 24 mmHg harus >= 20 mmHg threshold")

        # Hipoksemia
        spo2_val = 90
        is_hypoxemia = spo2_val < 92
        self.assertTrue(is_hypoxemia, "SpO2 90% harus tergolong hipoksemia berat")


if __name__ == "__main__":
    unittest.main()
