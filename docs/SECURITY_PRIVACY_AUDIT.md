# AUDIT KEAMANAN SISTEM, PRIVASI DATA KESEHATAN, & KEPATUHAN REGULASI
## Evaluasi Kepatuhan UU No. 27/2022 (UU PDP) & Permenkes No. 24/2022 (Rekam Medis Elektronik)
### CardioWork Enterprise CDSS — Versi 1.0.0

---

## 1. IKHTISAR EKSEKUTIF KEPATUHAN

CardioWork dirancang dengan prinsip **Privacy by Design** dan **Security by Default** untuk memenuhi regulasi ketat tata kelola data kesehatan kerja di Indonesia. Rekam medis kesehatan kerja (MCU dan DCU) memuat data fisiologis yang diklasifikasikan sebagai **Data Pribadi yang Bersifat Spesifik** berdasarkan **Pasal 4 Ayat (2) Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**.

Dokumen ini memaparkan audit teknis terhadap mekanisme proteksi data, kontrol akses, pencegahan kebocoran informasi melalui agregasi data, serta mitigasi risiko keamanan pada lapisan kecerdasan buatan (*AI/ML Model Serving*).

---

## 2. KEPATUHAN UU NO. 27 TAHUN 2022 (UU PELINDUNGAN DATA PRIBADI)

### 2.1 Klasifikasi Data Pribadi Spesifik (Pasal 4 & 5)
Data hasil pemeriksaan MCU tahunan dan tanda vital DCU harian dikategorikan sebagai *Data dan Informasi Kesehatan*. Pemrosesannya mewajibkan standar pengamanan tingkat tinggi:
* **Dasar Hukum Pemrosesan (Pasal 20):** Dilakukan atas dasar pemenuhan kewajiban hukum pemberi kerja di bidang Keselamatan dan Kesehatan Kerja (K3) sesuai UU No. 1/1970 dan Permenakertrans No. Per.02/MEN/1980.
* **Prinsip Pembatasan Tujuan (Pasal 16 Ayat 2):** Data hanya diolah untuk penilaian kelaikan kerja (*fit-to-work*) dan pencegahan penyakit kardiovaskular kerja, tidak dialihkan untuk penilaian performa komersial atau pemutusan hubungan kerja sepihak.

### 2.2 Penyamaran Sel Kecil (*Small-Cell Suppression* $N < 5$)
Salah satu risiko kebocoran privasi terbesar pada dashboard analitik populasi K3 adalah **Serangan Inferensi Keanggotaan (*Membership Inference Attack*)** atau **Rekonstruksi Identitas** pada kelompok divisi kerja dengan jumlah anggota sangat sedikit.

**Mekanisme Teknis Proteksi:**
Sistem menerapkan algoritma penekanan sel (*cell suppression*) pada modul agregasi analitik (`apps/web/src/lib/populationData.ts`):
```typescript
// Implementasi Kepatuhan UU PDP Pasal 16 & Pedoman Tata Kelola Data Statistik
export const SUPPRESSION_THRESHOLD = 5;

// Setiap metrik agregat per departemen / status risiko dengan jumlah < 5
// disamarkan secara deterministik menjadi tanda sensor:
if (count > 0 && count < SUPPRESSION_THRESHOLD) {
  displayValue = "<5*"; // Masked cell to prevent individual re-identification
}
```
* **Kompilasi Pengujian Unit:** Kepatuhan algoritma penekanan sel diuji secara otomatis dan lulus 100% pada suite pengujian `ml/tests/test_population_and_shap.py::test_population_small_cell_suppression`.
* **Proteksi Departemen Kecil:** Bila departemen seperti *Marine Logistics* atau *Subsea Diving* hanya memiliki 3 pekerja dengan kategori *Risiko Tinggi*, angka 3 tidak akan ditampilkan ke layar tim manajemen, melainkan `<5*`.

### 2.3 Pseudonimisasi & Arsitektur Nol PII Klien (*Zero Client PII*)
1. Seluruh rekaman data pekerja dalam basis data operasional diidentifikasi menggunakan kode pseudonim terstruktur (`WRK-0001` hingga `WRK-1000`).
2. Nomor Induk Kependudukan (NIK), Nomor Paspor, dan Rekam Kontak Pribadi diisolasi pada kluster basis data terenkripsi dan **tidak pernah disertakan dalam payload JSON yang dikirimkan ke peramban klien**.
3. Komponen visualisasi peramban hanya menerima data pseudonim dan atribut risiko fisiologis yang relevan untuk sesi klinis aktif.

---

## 3. KEPATUHAN PERMENKES NO. 24 TAHUN 2022 (REKAM MEDIS ELEKTRONIK)

| Pasal Regulasi | Ketentuan Permenkes 24/2022 | Implementasi Teknis CardioWork | Status |
| :--- | :--- | :--- | :---: |
| **Pasal 26** | Keamanan data rekam medis elektronik melalui enkripsi dan otentikasi ganda. | Enkripsi end-to-end TLS 1.3 transit, Database Transparent Data Encryption (TDE) AES-256, autentikasi sesi berbasis JWT HMAC-SHA256 ber-TTL pendek. | ✅ **PATUH** |
| **Pasal 27** | Pembatasan hak akses (*Role-Based Access Control*) sesuai wewenang profesi. | RBAC ketat: Pekerja hanya melihat profil mandiri; Paramedis menginput DCU; Dokter Perusahaan memegang akses klinis penuh; HSSE/HR dibatasi pada laporan agregat tersensor. | ✅ **PATUH** |
| **Pasal 29** | Pencatatan rekam jejak audit (*Audit Trail*) yang tidak dapat diubah (*append-only*). | Setiap aksi pembacaan (*READ*), pengubahan status kelaikan (*UPDATE*), dan ekspor resume (*EXPORT*) dicatat dalam log audit imun dengan stempel waktu ISO-8601 dan IP asal. | ✅ **PATUH** |
| **Pasal 31** | Integritas dokumen medis digital dan pencegahan manipulasi rekam medis. | Seluruh Resume Medis Digital (A4) dilengkapi verifikasi kriptografi **SHA-256 Integrity Digest** yang terikat secara unik dengan data riwayat pekerja. | ✅ **PATUH** |

---

## 4. KEAMANAN LAPISAN KECERDASAN BUATAN (*AI/ML INFERENCE SECURITY*)

### 4.1 Eliminasi Risiko *Arbitrary Code Execution* (`pickle` Vulnerabilities)
* Sistem **TIDAK PERNAH** memuat file Python pickle mentah (`.pkl` atau `.joblib`) pada lingkungan produksi peramban atau serverless web runtime.
* Seluruh model diproduksi secara offline di lingkungan terisolasi `ml/` dan diekspor ke format terbuka berstandar industri: **ONNX (*Open Neural Network Exchange*)**.
* Integritas artefak model dijamin melalui pengecekan ukuran dan checksum model:
  - `apps/web/public/models/classical_ml_model.onnx` (~59.7 KB)
  - `apps/web/public/models/multimodal_fusion.onnx` (~1.1 MB)
  - `apps/web/public/models/autoencoder_anomaly.onnx` (~8.7 KB)

### 4.2 Ketahanan Serverless & Pencegahan *Denial-of-Service* (DoS)
* **Dual Inference Architecture:** Serverless Function Vercel dilengkapi mekanisme deteksi ketersediaan modul native C++ (`onnxruntime-node`).
* Jika terjadi *cold start timeout* atau kegagalan pustaka C++ pada lingkungan serverless yang terkekang memori, sistem secara otomatis beralih (*graceful fallback*) ke modul inferensi murni TypeScript (`apps/web/src/lib/inference/unifiedInference.ts`) yang menggunakan bobot kalibrasi matematis terstandar (`scaler_deep_learning.json`).
* Strategi ini mencegah timbulnya galat 500 (*Internal Server Error*) yang dapat melumpuhkan alur pemeriksaan kiosk di lapangan offshore.

### 4.3 Ketahanan Input & Sanitasi Skema (Contract Enforcement)
* Seluruh input data tanda vital harian divalidasi secara ketat di pintu masuk API (`/api/inference/predict` dan `/api/dcu/kiosk`) menggunakan pustaka skema **Zod** (`packages/shared/src/schemas/vitalSigns.ts`).
* Nilai-nilai di luar batas fisiologis manusia (mis. SBP $< 50$ atau $> 300$, SpO2 $> 100\%$, Suhu $< 30^\circ\text{C}$) ditolak langsung dengan status HTTP 422 Unprocessable Entity sebelum mencapai mesin inferensi.

---

## 5. REKOMENDASI PENGUATAN LANJUTAN MENUJU AUDIT ISO 27001 / SOC 2

1. **Rotasi Rahasia Berkala (Secret Rotation):**
   - Terapkan rotasi token `NEXTAUTH_SECRET` dan string koneksi database Neon setiap 90 hari melalui manajer rahasia cloud (*AWS Secrets Manager* atau *Vercel Environment Variables API*).
2. **Koneksi Jaringan Privat (VPC Peering):**
   - Untuk implementasi di infrastruktur korporasi BUMN / Minyak & Gas, hubungkan basis data Postgres melalui jalur *Private Service Connect* atau *VPC Peering* tanpa mengekspos port 5432 ke internet publik.
3. **Penyimpanan Log Jangka Panjang:**
   - Alirkan (*stream*) catatan audit rekam medis elektronik ke media penyimpanan *Write Once Read Many* (WORM) seperti Amazon S3 Glacier dengan *Object Lock* selama 5 tahun untuk kepatuhan litigasi ketenagakerjaan.

---

**Auditor Keamanan & Privasi Sistem:**  
*Health Informatics & Cybersecurity Working Group*  
CardioWork Enterprise Platform
