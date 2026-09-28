# PANDUAN DEPLOYMENT PRODUKSI VERCEL & CLOUD SERVERLESS
## Deployment Terpadu Vercel (Region `sin1`), Neon Serverless Postgres, & Upstash Redis
### CardioWork Enterprise CDSS — Versi 1.0.0

---

## 1. IKHTISAR INFRASTRUKTUR CLOUD

CardioWork dirancang khusus untuk berjalan secara efisien pada ekosistem **Modern Serverless Edge & Cloud Functions**, mengeliminasi kebutuhan pengelolaan server fisik (*serverless zero-maintenance*), dengan performa latensi ultra-rendah untuk pengguna di Indonesia.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Pengguna / Kios di Indonesia             │
                    └───────────────────────────┬────────────────────────────┘
                                                │ HTTPS (TLS 1.3)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Vercel Serverless Platform (Region: sin1 - Singapore)                                 │
│                                                                                        │
│  ┌───────────────────────────┐     ┌────────────────────────────────────────────────┐ │
│  │   Next.js 14 App Router   │     │  Vercel Serverless Function (1024 MB Node.js) │ │
│  │  - Dashboard Klinis       │────▶│  - POST /api/inference/predict                 │ │
│  │  - Kios Mandiri (/kiosk)  │     │  - Dual ONNX Runtime + Calibrated TS Fallback  │ │
│  │  - Model Lab & Populasi   │     │  - Real-time Alerting Engine                   │ │
│  └───────────────────────────┘     └───────────────────────┬────────────────────────┘ │
└────────────────────────────────────────────────────────────┼───────────────────────────┘
                                                             │
                              ┌──────────────────────────────┴──────────────────────────────┐
                              ▼                                                             ▼
               ┌───────────────────────────────┐                             ┌──────────────────────────────┐
               │    Neon Serverless Postgres   │                             │        Upstash Redis         │
               │   (AWS ap-southeast-1 Pooler) │                             │   (REST API Rate Limiter)    │
               │  - Data Pekerja, MCU, & DCU   │                             │  - Cache Peringatan Harian   │
               │  - Immutable Audit Trail      │                             │  - Rate Limiting Kios        │
               └───────────────────────────────┘                             └──────────────────────────────┘
```

---

## 2. PRASYARAT LAYANAN CLOUD

Sebelum memulai deployment, pastikan Anda telah memiliki akun aktif pada:
1. **GitHub** (tempat repositori [cardiowork](https://github.com/kahpiba/cardiowork.git) berada).
2. **Vercel** ([https://vercel.com](https://vercel.com)).
3. **Neon Serverless Postgres** ([https://neon.tech](https://neon.tech)).
4. **Upstash Redis** ([https://upstash.com](https://upstash.com)).

---

## 3. LANGKAH 1: PROVISI BASIS DATA DI NEON POSTGRES

1. Masuk ke dashboard [Neon.tech](https://neon.tech) dan klik **Create Project**.
2. Beri nama proyek: `cardiowork-production`.
3. Pilih Region: **AWS Singapore (`ap-southeast-1`)** (untuk meminimalkan latensi jaringan antar-Vercel `sin1`).
4. Pada tab **Connection Details**:
   - Pilih mode **Pooled Connection** (menggunakan pgBouncer bawaan Neon).
   - Salin connection string tersebut sebagai nilai variabel `DATABASE_URL`.
   - Pilih mode **Direct Connection** (tanpa pgbouncer) dan salin sebagai `DIRECT_URL`.

---

## 4. LANGKAH 2: PROVISI CACHE DI UPSTASH REDIS

1. Masuk ke dashboard [Upstash.com](https://upstash.com) $\rightarrow$ **Redis** $\rightarrow$ **Create Database**.
2. Beri nama: `cardiowork-cache`.
3. Pilih Region: **Singapore (`ap-southeast-1`)**.
4. Di bagian **REST API Credentials**, salin:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 5. LANGKAH 3: DEPLOYMENT PROYEK KE VERCEL

### 5.1 Impor Repositori
1. Buka dashboard [Vercel](https://vercel.com) $\rightarrow$ Klik **Add New...** $\rightarrow$ **Project**.
2. Pilih repositori **`kahpiba/cardiowork`**.
3. Di bagian **Configure Project**:
   * **Project Name:** `cardiowork`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Klik *Edit* dan pilih folder **`apps/web`**.

### 5.2 Pengaturan Build & Monorepo
* Vercel secara otomatis mendeteksi konfigurasi pnpm workspaces pada root proyek.
* **Build Command:** `pnpm build`
* **Output Directory:** `.next`
* **Install Command:** `pnpm install`

### 5.3 Konfigurasi Environment Variables di Vercel
Tambahkan pasangan *Key-Value* berikut pada menu **Environment Variables**:

| Variable Name | Contoh Nilai Produksi | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-demo.ap-southeast-1.aws.neon.tech/cardiowork?sslmode=require&pgbouncer=true` | Koneksi Neon Postgres pooler |
| `DIRECT_URL` | `postgresql://user:pass@ep-demo.ap-southeast-1.aws.neon.tech/cardiowork?sslmode=require` | Koneksi langsung migrasi database |
| `UPSTASH_REDIS_REST_URL` | `https://ap1-humble-mammal-12345.upstash.io` | Endpoint REST Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | `AY12ASQgMDcyMWJmYWEtMWQ...` | Token otentikasi Upstash |
| `NEXTAUTH_SECRET` | *(Kunci rahasia acak 32-karakter, mis. `openssl rand -base64 32`)* | Rahasia enkripsi token sesi |
| `NEXTAUTH_URL` | `https://cardiowork.vercel.app` | URL domain publik aplikasi Anda |
| `NEXT_PUBLIC_APP_URL` | `https://cardiowork.vercel.app` | Base URL publik |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Mengaktifkan dataset 1.000 pekerja bawaan |
| `INFERENCE_MODE` | `onnx-node` | Mode komputasi inferensi serverless |
| `POPULATION_SUPPRESSION_THRESHOLD` | `5` | Kepatuhan UU PDP No. 27/2022 ($N < 5$ disamarkan) |

---

## 6. VALIDASI KONFIGURASI `apps/web/vercel.json`

Pastikan file konfigurasi `apps/web/vercel.json` telah menyertakan alokasi memori optimal untuk inferensi ONNX:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "src/app/api/inference/predict/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    },
    "src/app/api/alerts/daily/route.ts": {
      "memory": 512,
      "maxDuration": 30
    },
    "src/app/api/cron/daily-anomaly-scan/route.ts": {
      "memory": 512,
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/daily-anomaly-scan",
      "schedule": "0 23 * * *"
    }
  ]
}
```

> **Catatan Teknis Memori:** Alokasi `1024 MB` pada endpoint `/api/inference/predict` diperlukan untuk menampung runtime C++ `onnxruntime-node` dan buffer komputasi tensor float32 model Multimodal Fusion saat *cold start*.

---

## 7. PROSEDUR POST-DEPLOYMENT & VERIFIKASI KESEHATAN SISTEM

Setelah Vercel menyelesaikan proses build (`Deployment Ready`), lakukan verifikasi fungsionalitas:

### 7.1 Uji Inferensi Prediksi Serverless (cURL)
```bash
curl -X POST "https://[domain-anda].vercel.app/api/inference/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "WRK-0001",
    "features": {
      "age": 45, "sex": "male", "systolic_bp": 145, "diastolic_bp": 92,
      "cholesterol_total": 230, "cholesterol_hdl": 38, "smoker": true, "diabetes": false,
      "bmi": 28.4, "resting_heart_rate": 84, "spo2": 97, "ecg_category": "Borderline",
      "fasting_blood_glucose": 110, "triglycerides": 190, "fatigue_score": 3
    }
  }'
```
*Respons Sukses:* HTTP 200 dengan payload JSON memuat `classical_ml_risk`, `deep_learning_fusion_risk` beserta interval kepercayaan 95% (`confidence_interval_95`), status anomali autoencoder, dan rekomendasi triage klinis.

### 7.2 Uji Kios Mandiri Pra-Shift
* Kunjungi peramban: `https://[domain-anda].vercel.app/kiosk`
* Masukkan ID Pekerja: `WRK-0001`
* Coba simulasi input tekanan darah normal vs tekanan darah krisis ($185/115$ mmHg) dan pastikan banner darurat merah menyala secara instan.

### 7.3 Uji Ekspor Resume Medis A4 (Print/PDF)
* Kunjungi peramban: `https://[domain-anda].vercel.app/reports/view/WRK-0001`
* Verifikasi tampilan Kop Surat Resmi Klinik, logo sertifikasi, grafik tren longitudinal MCU, dan **Kode Verifikasi SHA-256 Digest**.
* Tekan tombol **Cetak / Simpan PDF** dan periksa tata letak halaman A4 standar medis.

---

## 8. MONITORING & TROUBLESHOOTING

1. **Vercel Runtime Logs:**
   - Akses tab **Logs** di Vercel Dashboard untuk memantau waktu eksekusi inferensi real-time. Target waktu respons: $< 150$ ms.
2. **Penanganan Serverless Cold-Start:**
   - Bila `onnxruntime-node` mengalami hambatan inisialisasi pada container serverless baru, engine CardioWork secara otomatis beralih ke *Calibrated TypeScript Engine* tanpa memicu error 500 bagi pengguna.

---

*Disiapkan oleh Tim Arsitektur Cloud & Machine Learning CardioWork Enterprise.*
