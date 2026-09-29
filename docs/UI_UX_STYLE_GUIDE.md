# CardioWork Design System & Style Guide
**Sistem Panduan Desain UI/UX — Health-Tech & Occupational Health Decision Support**
*Versi 1.0 • Standar Klinis & Antarmuka Terpadu (Light Medical Theme)*

---

## 1. Filosofi & Prinsip Desain Inti

CardioWork dirancang khusus untuk memfasilitasi pengambilan keputusan klinis keselamatan dan kesehatan kerja (K3) di lingkungan industri berisiko tinggi.

### 5 Pilar Desain Utama:
1. **Kejelasan & Keselamatan di Atas Estetika (Safety First)**:
   Antarmuka adalah alat pendukung keputusan medis (*decision-support*). Angka vital, ambang batas bahaya, dan skor probabilitas risiko kardiovaskular tidak boleh tersamar oleh dekorasi grafis atau animasi yang berlebihan.
2. **Tanpa Mode Gelap (Strict Light Medical Theme)**:
   Aplikasi menggunakan tema terang bersih dengan latar belakang Slate-50 (`#F8FAFC`), grid medis subtil, dan teks Deep Navy (`#0F172A`). Mode gelap dilarang karena menurunkan legibilitas grafik medis di bawah pencahayaan lapangan/kios dan bertolak belakang dengan atmosfer klinis yang menenangkan.
3. **Redundansi Multi-Sensori (Color-Blind Safe)**:
   Informasi keparahan risiko **tidak pernah** disampaikan hanya melalui warna. Setiap level risiko wajib didampingi oleh bentuk geometri ikon diskrit, teks label eksplisit, dan nilai numerik persentase.
4. **Pengungkapan Progresif 3-Tingkat (Progressive Disclosure)**:
   - *Tingkat 1 (At-a-Glance)*: Skor risiko, kategori, dan status kelayakan kerja langsung terlihat dalam <3 detik.
   - *Tingkat 2 (Clinical Attribution)*: Pembobotan faktor risiko TreeSHAP dan komparasi 3 model formula baku (WHO SEARO, Framingham, ASCVD).
   - *Tingkat 3 (Deep Dive)*: Deret waktu DCU 30 hari, riwayat longitudinal MCU 3 tahun, dan rujukan sitasi jurnal ilmiah.
5. **Gerak Berpikir, Bukan Hiasan (Purposeful Motion)**:
   Animasi digunakan untuk memandu fokus (*focal guidance*), peredam kejutan emosional (*cognitive pacing*), dan konfirmasi aksi instan. Seluruh gerak wajib tunduk pada `@media (prefers-reduced-motion: reduce)`.

---

## 2. Fondasi Visual & Token Desain

### A. Palet Warna (Color Palette)

#### 1. Warna Utama & Teks Medis
| Nama Token | Hex Code | Tailwind Class | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Medical Teal** | `#0D9488` | `bg-teal-600`, `text-teal-700` | Brand primer, tombol aksi utama, status normal sehat |
| **Deep Slate Navy** | `#0F172A` | `text-slate-900` | Teks judul utama, angka metrik besar, kontras maksimal (WCAG AAA) |
| **Slate Body** | `#334155` | `text-slate-700` | Paragraf deskripsi, label parameter |
| **Muted Slate** | `#64748B` | `text-slate-500` | Teks sekunder, satuan unit (`mmHg`, `mg/dL`), timestamp |
| **Clean Background** | `#F8FAFC` | `bg-slate-50` | Latar belakang kanvas aplikasi |
| **Surface Card** | `#FFFFFF` | `bg-white` | Kontainer kartu metrik, modal, dropdown |
| **Subtle Border** | `#E2E8F0` | `border-slate-200` | Garis batas kartu, pemisah tabel, divider |

#### 2. Skala Risiko Kardiovaskular (Color-Blind Safe)
| Tingkat Risiko | Rentang Nilai | Hex Code | Bentuk Ikon (Dual-Channel) | Tailwind Token |
| :--- | :--- | :--- | :--- | :--- |
| **Rendah (Low)** | `< 10.0%` | `#0D9488` (Teal) | Lingkaran (`CheckCircle2`) | `bg-teal-50 text-teal-800 border-teal-200` |
| **Sedang (Moderate)** | `10.0% – 19.9%` | `#D97706` (Amber) | Belah Ketupat (`AlertCircle`) | `bg-amber-50 text-amber-800 border-amber-200` |
| **Tinggi (High)** | `20.0% – 29.9%` | `#EA580C` (Tangerine) | Segitiga (`AlertTriangle`) | `bg-orange-50 text-orange-800 border-orange-200` |
| **Kritis (Critical)** | `≥ 30.0%` | `#BE123C` (Crimson) | Perisai Tanda Seru (`ShieldAlert`) | `bg-rose-50 text-rose-800 border-rose-200` |

---

### B. Tipografi Medis

- **Font Sans**: Inter / Segoe UI / SF Pro (`font-sans`) untuk teks judul, label, dan narasi edukasi.
- **Font Mono**: JetBrains Mono / Roboto Mono (`font-mono`) **WAJIB** digunakan untuk seluruh data kuantitatif:
  - Angka tekanan darah (`120/80 mmHg`)
  - Skor persentase risiko (`18.5%`)
  - ID Pekerja / Pseudonim (`W-00192`)
  - Hasil lab biokimia (`195 mg/dL`)
- **Tabular Nums (`tabular-nums`)**: Wajib disematkan pada seluruh elemen angka dinamis agar digit memiliki lebar tetap dan tidak bergetar saat nilai bertransisi.

---

### C. Elevasi & Grid Medis
- **Border Radius**: Konsisten `rounded-xl` (12px) untuk elemen kontrol dan `rounded-2xl` (16px) untuk kontainer kartu utama.
- **Shadows**:
  - `shadow-2xs`: Bayangan mikro untuk tombol dan pill status.
  - `shadow-xs`: Bayangan kartu statis default.
  - `shadow-md`: Elevasi interaksi saat hover atau modal aktif.
- **Medical Grid Background**: Menggunakan utility `.bg-medical-grid` (grid 28px dengan garis slate 8% opasitas) untuk memberikan kesan kertas grafik rekam medis presisi.

---

## 3. Spesifikasi Motion Design Tokens

| Token | Durasi | Easing Function | Konteks Penggunaan | Aturan Klinis |
| :--- | :--- | :--- | :--- | :--- |
| `motion-instant` | `0ms` | `linear` | Saat `prefers-reduced-motion` aktif atau update data darurat | 🛡️ **Non-Negotiable**: Data kegawatdaruratan tidak boleh tertunda |
| `motion-micro` | `120ms` | `cubic-bezier(0, 0, 0.2, 1)` | Klik tombol, centang gejala, switch toggle | 🎨 **Flexible**: Respons sentuhan cepat |
| `motion-panel` | `240ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Buka accordion rujukan, ekspansi laci tabel | 🎨 **Flexible**: Kontinuitas ruang spasial |
| `motion-gauge` | `500ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | Pengisian busur radial gauge risiko | 🛡️ **Non-Negotiable**: Pacing lembut, dilarang akselerasi liar |
| `motion-counter`| `600ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hitungan angka persentase risiko | 🛡️ **Non-Negotiable**: Wajib didampingi font `tabular-nums` |
| `motion-pulse` | `2400ms` | `cubic-bezier(0.4, 0, 0.6, 1)` | Indikator live status & anomali vital ringan | 🛡️ **Non-Negotiable**: Dilarang berkedip cepat (*no strobe/flicker* < 3Hz) |

### Universal Reduced-Motion Fallback (Wajib):
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. Pedoman Anatomi 7 Komponen Kunci

### 1. `RadialRiskGauge`
- **Anatomi**: Busur SVG 180° semi-sirkular tebal 14px, penanda batas 10% dan 20%, angka persentase besar di tengah, badge kategori multi-sensori, dan catatan interval kepercayaan (95% CI).
- **Aturan**: Dilarang menggunakan busur 360° penuh untuk skor risiko 10-tahun karena memberi impresi salah bahwa risiko bisa mencapai 100%. Skala visual dibatasi proporsional pada rentang 0–40%.

### 2. `ClinicalScoreCard`
- **Anatomi**: Integrasi `RadialRiskGauge` di sisi kiri + kartu komparasi 3 model formula baku di sisi kanan.
- **Rujukan**: WHO SEARO wajib ditandai sebagai **Acuan Utama Indonesia**, sedangkan ASCVD wajib memiliki label peringatan overestimasi pada populasi Asia.

### 3. `DcuTrendChart`
- **Anatomi**: Sumbu Y rentang 50–200 mmHg, shaded band hijau lembut pada 90–120 mmHg (rentang optimal), garis batas merah putus-putus pada 140 mmHg, dan titik anomali berdenyut halus.
- **Aksesibilitas**: Wajib menyediakan tombol pembuka laci tabel semantik (`<table role="table">`) untuk pengguna pembaca layar.

### 4. `DailyAlertBanner`
- **Anatomi**: Kontainer peringatan berlatar Rose-50 (Kritis) atau Amber-50 (Waspada) dengan border kiri tebal.
- **Aksi SOP**: Wajib memuat tombol tindakan operasional nyata: *[Istirahat 15 Menit & Ukur Ulang]* dan *[Tunda Shift / Rujukan]*. Dilarang menyajikan banner peringatan tanpa instruksi tindakan lanjutan.

### 5. `WhatIfSimulator`
- **Anatomi**: Slider target SBP (-40 mmHg), Kolesterol Total (-80 mg/dL), HDL (+25 mg/dL), dan toggle penghentian merokok.
- **Metrik Hadiah (*Reward Metric*)**: Menampilkan penurunan risiko absolut (ARR), penurunan relatif (RRR), dan estimasi pemulihan usia vaskular (*vascular age recovery*).

### 6. `ShapWaterfallChart`
- **Anatomi**: Sumbu tengah 0.0. Batang kanan oranye (menaikkan risiko), batang kiri teal (protektif).
- **Kategorisasi**: Terbagi tegas antara tab **Dapat Diubah (*Modifiable Lifestyle*)** vs **Faktor Bawaan (*Fixed Age/Demographics*)** agar pekerja tidak putus asa terhadap faktor usia.

### 7. `ClinicalSkeleton` & `EducationalEmptyState`
- **ClinicalSkeleton**: Mempertahankan rasio aspek komponen asli dengan efek sapuan *medical-shimmer* 1.8s (CLS = 0).
- **EducationalEmptyState**: Ilustrasi medis vektor bersih, teks yang tidak menghakimi, dan tautan aksi eksplisit ke pos skrining kios.

---

## 5. Batasan Keselamatan Klinis & Regulasi Privasi (Non-Negotiable)

1. **Bukan Alat Diagnosis Mandiri (*Decision Support Only*)**:
   Setiap tampilan halaman wajib memuat penafian medis bahwa CardioWork adalah sistem pendukung keputusan K3, bukan diagnosis definitif. Rekomendasi restriksi kerja wajib divalidasi oleh dokter okupasi berizin (Sp.Ok).
2. **Kepatuhan UU PDP No. 27/2022 (Supresi Sel Kecil)**:
   Pada seluruh dashboard agregat populasi (`/population`), setiap sel data yang memiliki jumlah pekerja kurang dari 5 orang ($N < 5$) **wajib disupresi otomatis** dan ditampilkan sebagai `<5*` untuk mencegah re-identifikasi pekerja.
3. **Penyimpanan ID Pseudonim**:
   Antarmuka publik dilarang menampilkan NIK atau nama asli tanpa enkripsi; gunakan ID pekerja terproteksi (*misal*: `W-00192`).

---

## 6. Checklist Do's & Don'ts untuk Desainer & Developer

| Aspek | ✅ Boleh & Sangat Dianjurkan (DO) | ❌ Dilarang Keras (DON'T) |
| :--- | :--- | :--- |
| **Tema Visual** | Gunakan latar putih/slate-50 dengan aksen Teal dan Slate Navy | Jangan pernah menggunakan mode gelap (*dark theme*) |
| **Warna Risiko** | Sandingkan warna merah/oranye dengan bentuk ikon (segitiga/perisai) dan teks | Jangan menggunakan warna tunggal tanpa teks dan ikon penjelas |
| **Tipografi Angka** | Selalu aktifkan font `monospace` dan class `tabular-nums` pada nilai lab/tensi | Jangan gunakan font proporsional standar yang angka lebarnya goyang |
| **Animasi** | Buat animasi halus berdurasi 120–500ms dengan kurva ease-out lembut | Jangan gunakan efek strobo, denyut cepat (<3Hz), atau bouncing liar |
| **Input Form Paramedis**| Sediakan `inputmode="numeric"` dan tombol aksi besar min 48px | Jangan membuat input kecil yang menyulitkan petugas bertablet/sarung tangan |
| **Pesan Anomali** | Sertakan langkah SOP K3 (istirahat, ukur ulang, tunda shift) | Jangan hanya memunculkan pesan error "Nilai Tidak Normal" tanpa panduan |
| **Privasi Agregat** | Masking sel $N < 5$ menjadi `<5*` di laporan HR/K3 | Jangan tampilkan angka 1 atau 2 orang pada laporan departemen kecil |
| **Edukasi Awam** | Sediakan mode penjelasan sederhana untuk istilah medis (SHAP, Framingham) | Jangan paksa pekerja awam membaca rumus log-odds tanpa terjemahan bahasa umum |
