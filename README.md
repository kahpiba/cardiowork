# CardioWork — Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Ready%20(sin1)-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Postgres Serverless](https://img.shields.io/badge/Postgres-Neon%20Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![License: Evaluation](https://img.shields.io/badge/License-Proprietary%20Demo-red?style=for-the-badge)](./LICENSE)

> **Sistem Pendukung Keputusan Klinis Kesehatan Kerja (K3) Terpadu**  
> Mengintegrasikan Rekam Medis Tahunan (*Medical Check-Up* / MCU) dan Pemantauan Tanda Vital Harian (*Daily Check-Up* / DCU) Menggunakan Arsitektur Inferensi Bertingkat (Layer 1–4) Berbasis *Edge AI* dan *Serverless Deployment*.

---

> ⚠️ **PENAFIAN KEPATUHAN MEDIS & PRIVASI:**  
> 1. **Bukan Alat Diagnosis:** Aplikasi ini adalah *Clinical Decision Support System (CDSS)* untuk membantu dokter perusahaan dan tim K3 melakukan penapisan dini. Semua rekomendasi wajib ditinjau oleh tenaga medis berlisensi.  
> 2. **Data Sintetis:** Repositori ini 100% menggunakan data sintetis untuk keperluan percontohan (*pilot evaluation*). Tidak ada data rekam medis pekerja asli yang disimpan.

---

## 🏗️ Arsitektur Monorepo (`pnpm workspaces`)

```
cardiowork/
├── apps/
│   └── web/                   # Next.js 14+ (App Router, TS, Tailwind, shadcn/ui) -> Vercel Root
├── packages/
│   └── shared/                # Zod schemas, TypeScript types, feature_spec.json (Source of Truth)
├── ml/                        # Pelatihan PyTorch & ML klasik (Offline, TIDAK di-deploy ke Vercel)
├── services/
│   └── inference/             # FastAPI + ONNX Runtime Docker (Jalur alternatif remote)
├── docs/                      # ERD, Kamus Data, Model Cards, Panduan Pengguna
└── .github/                   # Workflows CI, Dependabot, PR Template, CODEOWNERS
```

---

## 🩺 Mesin Prediksi 4-Tingkat (Multi-Tier Engine)

1. **Layer 1 — Skor Klinis Established (Transparan)**:
   * *Framingham General CVD (10-Year)*
   * *WHO/ISH Regional Chart (Asia Tenggara / SEARO)*
   * *ASCVD Pooled Cohort Equations (dengan recalibration/disclaimer populasi Asia)*
2. **Layer 2 — Machine Learning Klasik**:
   * Baseline model pohon keputusan (*LightGBM, XGBoost, Random Forest*) terkalibrasi.
3. **Layer 3 — Deep Learning PyTorch (Offline Training $\rightarrow$ ONNX INT8)**:
   * **3A.** Tabular MLP dengan categorical embeddings untuk MCU.
   * **3B.** Temporal 1D-CNN / GRU-D dengan masking hari hilang (*irregular sampling*) untuk DCU.
   * **3C.** Multimodal Fusion (MCU Encoder + DCU Encoder $\rightarrow$ Multi-Task Heads).
   * **3D.** Survival Time-to-Event (DeepSurv / Cox PH).
   * **3E.** Autoencoder Anomaly Detection untuk mendeteksi deviasi tanda vital dari baseline personal.
   * **3F.** (Eksperimental) 1D-CNN Classifier untuk sinyal EKG Lead-II mentah (500 sampel).
   * **3G.** Ketidakpastian Prediksi (MC Dropout / Deep Ensemble).
   * **3H.** Explainable AI (SHAP Waterfall + Temporal Attribution Heatmap).
4. **Layer 4 — Daily Alerting & Kios Mandiri Pekerja**:
   * Peringatan deterministik instan ($TD \ge 180/120$, $SpO_2 < 92\%$, dll.) + Kios mandiri tensimeter.

---

## 👥 Matriks Hak Akses Pengguna (RBAC)

| Peran Pengguna | Akses Klinis Individual | Input DCU Harian | Tindak Lanjut / Catatan Dokter | Dashboard Populasi K3 |
| :--- | :---: | :---: | :---: | :---: |
| **Pekerja** | Hanya data sendiri | Kios Mandiri | Lihat saran gaya hidup | ❌ Dilarang |
| **Paramedis / Perawat** | ✅ Akses | ✅ Input & Verifikasi | Lihat alert aktif | ❌ Dilarang |
| **Dokter Perusahaan** | ✅ Akses Penuh | ✅ Input | ✅ Resep & Restriksi Kerja | ✅ Akses Penuh |
| **Tim K3 (HSSE)** | ❌ Dilarang | ❌ Dilarang | Monitoring status kepatuhan | ✅ Agregat (Suppression $<5$) |
| **HR / Manajemen** | ❌ Dilarang | ❌ Dilarang | ❌ Dilarang | ✅ Laporan Anonim |
| **Admin Sistem** | ❌ Dilarang | ❌ Dilarang | Audit log & Konfigurasi | ❌ Dilarang |
| **Data Scientist** | Pseudonim saja | ❌ Dilarang | Model Lab & Registri | ✅ Agregat |

---

## 🚀 Panduan Deployment ke Vercel (Langkah demi Langkah)

Sistem ini 100% kompatibel dengan arsitektur serverless Vercel:

1. **Impor Repositori ke Vercel**:
   * Buka Vercel Dashboard $\rightarrow$ **Add New Project** $\rightarrow$ Pilih repositori `cardiowork`.
2. **Atur Root Directory**:
   * Ubah **Root Directory** ke: `apps/web`.
3. **Konfigurasi Environment Variables**:
   * Salin variabel dari `.env.example` ke pengaturan Vercel Environment Variables:
     * `DATABASE_URL`: String koneksi Neon Postgres serverless (dengan pooler).
     * `AUTH_SECRET`: Secret 32 karakter acak.
     * `INFERENCE_MODE`: `onnx-node` (default Vercel runtime Node.js).
     * `NEXT_PUBLIC_DEMO_MODE`: `true`.
4. **Jalankan Migrasi Database**:
   ```bash
   pnpm --filter @cardiowork/web db:migrate
   ```
5. **Verifikasi Deployment**:
   * Buka endpoint kesehatan sistem: `https://[proyek-anda].vercel.app/api/health`.

---

## 💻 Panduan Menjalankan Proyek di Lokal

### Prasyarat:
* Node.js v20+ dan `pnpm` v9+
* Docker & Docker Compose (untuk Postgres & Redis lokal)
* Python 3.11+ (untuk eksperimen `ml/`)

### 1. Kloning Repositori & Pasang Dependensi
```bash
git clone https://github.com/upn-sainsdata/cardiowork.git
cd cardiowork
pnpm install
```

### 2. Jalankan Basis Data Lokal
```bash
docker-compose up -d
```

### 3. Konfigurasi Variabel Lingkungan
```bash
cp .env.example .env
```

### 4. Jalankan Server Pengembangan Web
```bash
pnpm dev
```
Akses aplikasi pada: `http://localhost:3000`

---

## 🛡️ Kepatuhan Keamanan & UU PDP No. 27/2022
* Seluruh akses data klinis dicatat dalam **Append-Only Immutable Audit Log**.
* Catatan medis dokter dienkripsi pada tingkat kolom (*Field-Level Encryption AES-256-GCM*).
* Proteksi *small-cell suppression* diterapkan otomatis pada dashboard agregat untuk mencegah re-identifikasi individu pada kelompok divisi kecil ($< 5$ orang).
