## Deskripsi Perubahan (Pull Request)

Mohon jelaskan ringkasan perubahan teknis yang diajukan dalam PR ini dan hubungannya dengan tahapan Phase proyek CardioWork.

### Jenis Perubahan
- [ ] `feat`: Penambahan fitur baru
- [ ] `fix`: Perbaikan bug
- [ ] `docs`: Pembaruan dokumentasi / kamus data
- [ ] `refactor`: Refaktorisasi kode tanpa mengubah fungsionalitas
- [ ] `test`: Penambahan / pembaruan pengujian (unit, integration, parity)
- [ ] `chore`: Pembaruan konfigurasi build, dependensi, CI

---

## Daftar Uji Kepatuhan & Keamanan (Wajib Dicentang)

### 1. Keamanan & Kerahasiaan Data (UU PDP No. 27/2022)
- [ ] **TIDAK ADA DATA PEKERJA ASLI** yang dikomit ke dalam repositori (hanya data sintetis).
- [ ] **TIDAK ADA RAHASIA/API KEY** atau berkas `.env` yang ikut terunggah (Gitleaks scan lolos).
- [ ] Tidak ada bobot checkpoint model besar yang belum dikompresi (>25MB).

### 2. Kompatibilitas Vercel Serverless
- [ ] Ukuran berkas ONNX terverifikasi $\le 20\text{ MB}$ (INT8 Quantized).
- [ ] Route Handlers yang menggunakan `onnxruntime-node` ditandai eksplisit dengan `export const runtime = "nodejs";`.
- [ ] Tidak ada dependensi stateful permanen (Celery/Daemon) pada runtime web.

### 3. Integritas Klinis & Model AI
- [ ] Setiap luaran skor risiko klinis menyertakan disclaimer *decision-support*.
- [ ] Uji paritas PyTorch $\leftrightarrow$ ONNX terkonfirmasi lolos uji selisih toleransi numerik ($\text{diff} < 10^{-4}$).
- [ ] Seluruh unit test lokal lolos (`pnpm test` & `pytest`).

---

## Isu / Tiket Terkait
Menutup: #
