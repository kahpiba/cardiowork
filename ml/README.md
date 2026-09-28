# Modul Machine Learning & Deep Learning Offline (CardioWork)

Direktori ini menampung seluruh alur pelatihan eksperimental Machine Learning (Layer 2) dan Deep Learning PyTorch (Layer 3) secara **offline** di lingkungan komputasi GPU/lokal.

> **PENTING:** Direktori `ml/` **TIDAK di-deploy ke Vercel**. Luaran dari modul ini yang disertakan ke aplikasi web hanyalah berkas model terkuantisasi INT8 berukuran ringan (`.onnx` $\le 20 \text{ MB}$) yang diletakkan pada `apps/web/public/models/`.

---

## Struktur Direktori

* `data/`: Generator data sintetis terstratifikasi ($N \ge 1.000$ pekerja).
* `features/`: Pipeline rekayasa fitur bersama yang patuh pada `packages/shared/feature_spec.json`.
* `models/`: Arsitektur PyTorch (MLP, TCN/GRU-D, Multimodal Fusion, Autoencoder Anomaly).
* `training/`: Training loop, objective loss terbobot, dan penalaan hiperparameter Optuna.
* `evaluation/`: Evaluasi metrik klinis (AUROC, AUPRC, Brier Score, Kalibrasi, Subgroup Fairness).
* `export/`: Skrip konversi dan kuantisasi INT8 PyTorch ke format ONNX.
* `tests/`: Pengujian unit dan uji paritas numerik PyTorch $\leftrightarrow$ ONNX.
