# Panduan Kontribusi & Alur Kerja Git (CardioWork)

Selamat datang di proyek **CardioWork — Prediksi Risiko Kardiovaskular Pekerja**. Dokumen ini mengatur standar kerja kolaboratif, konvensi commit, dan alur branching monorepo.

---

## 1. Alur Kerja Percabangan (Branching Model)

Proyek ini menggunakan strategi branching berbasis fitur dengan proteksi branch utama:

* `main`: Branch produksi yang dilindungi (*protected*). Selalu dalam status siap deploy ke Vercel Production. Tidak boleh ada direct push.
* `develop`: Branch integrasi pengembangan aktif. Seluruh fitur digabungkan ke sini terlebih dahulu melalui Pull Request.
* `feature/<phase>-<topik>`: Branch kerja untuk setiap phase (contoh: `feature/phase-1-foundation`, `feature/phase-2-data-pipeline`).

---

## 2. Standar Pesan Commit (Conventional Commits)

Format pesan commit wajib mengikuti spesifikasi **Conventional Commits**:

```
<tipe>(<lingkup opsional>): <deskripsi singkat imperatif>

[badan penjelasan detail jika diperlukan]

[referensi tiket/isu]
```

### Tipe Commit yang Diizinkan:
* `feat`: Penambahan fitur aplikasi atau model AI baru.
* `fix`: Perbaikan bug pada pipeline, kalkulasi, atau antarmuka.
* `docs`: Pembaruan dokumentasi, diagram ERD, atau kamus data.
* `refactor`: Perubahan struktur kode tanpa mengubah fungsionalitas.
* `test`: Penambahan pengujian unit, integrasi, atau paritas ONNX.
* `chore`: Pemeliharaan konfigurasi build, CI, atau dependensi.

---

## 3. Tag Rilis Akhir Phase

Setiap kali suatu tahapan Phase selesai diuji dan disetujui, branch digabungkan dan diberi tag semantik:
* `phase-0`: Desain Arsitektur & ERD disetujui.
* `phase-1`: Fondasi Monorepo, GitHub CI, & Vercel Skeleton.
* `phase-2`: Data Pipeline & Feature Contract.
* ...
* `v1.0.0`: Rilis final produksi siap audit.

---

## 4. Keamanan & Integritas Data Medis

1. **Dilarang Keras Commit Secret**: Kunci API, string koneksi basis data dengan kata sandi asli, dan token JWT tidak boleh masuk ke repositori.
2. **Dilarang Commit Data Pekerja Asli**: Seluruh pengujian dan demo wajib menggunakan generator data sintetis di `ml/data/`.
3. **Pemeriksaan Pre-commit**: Gunakan `gitleaks protect --staged` sebelum melakukan commit.
