# Kamus Data Klinis & Panduan Fitur (CardioWork Data Dictionary)

Dokumen ini merupakan panduan komprehensif seluruh variabel klinis dan operasional yang diproses oleh sistem **CardioWork**, selaras dengan `packages/shared/feature_spec.json`.

---

## 1. Variabel Rekam Medis Tahunan (MCU - Medical Check-Up)

| Nama Variabel | Tipe Data | Satuan | Rentang Valid | Nilai Default Imputasi | Keterangan Klinis |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `age` | Integer | Tahun | 18 – 75 | 38 | Usia kronologis pekerja. |
| `gender` | Kategori | Enum | `MALE`, `FEMALE` | `MALE` | Jenis kelamin biologis (penentu nilai ambang HDL & skor Framingham). |
| `height_cm` | Float | cm | 120.0 – 230.0 | 168.0 | Tinggi badan berdiri tegak tanpa alas kaki. |
| `weight_kg` | Float | kg | 30.0 – 250.0 | 68.0 | Berat badan aktual. |
| `bmi` | Float | $\text{kg/m}^2$ | 14.0 – 55.0 | 25.4 | Dihitung dari $\text{weight} / (\text{height}/100)^2$. |
| `waist_circumference_cm` | Float | cm | 40.0 – 180.0 | Median BMI | Lingkar perut (indikator obesitas sentral). |
| `systolic_bp` | Integer | mmHg | 70 – 250 | 120 | Tekanan darah sistolik istirahat. |
| `diastolic_bp` | Integer | mmHg | 40 – 150 | 80 | Tekanan darah diastolik istirahat. |
| `resting_heart_rate` | Integer | bpm | 40 – 160 | 72 | Denyut nadi istirahat per menit. |
| `fasting_glucose` | Float | mg/dL | 50.0 – 450.0 | 95.0 | Gula darah puasa $\ge 8$ jam. |
| `hba1c_percent` | Float | % | 3.5 – 16.0 | 5.4 | Hemoglobin terglikasi (rata-rata gula 3 bulan). |
| `total_cholesterol` | Float | mg/dL | 80.0 – 500.0 | 190.0 | Kolesterol total serum. |
| `hdl_cholesterol` | Float | mg/dL | 15.0 – 120.0 | 48.0 | High-Density Lipoprotein (faktor protektif). |
| `ldl_cholesterol` | Float | mg/dL | 30.0 – 350.0 | 115.0 | Low-Density Lipoprotein (faktor aterogenik). |
| `triglycerides` | Float | mg/dL | 30.0 – 800.0 | 140.0 | Trigliserida puasa. |
| `smoking_status` | Kategori | Enum | `NON_SMOKER`, `FORMER_SMOKER`, `ACTIVE_SMOKER` | `NON_SMOKER` | Riwayat merokok tembakau aktif. |
| `resting_ecg` | Kategori | Enum | `NORMAL`, `BORDERLINE`, `ABNORMAL` | `NORMAL` | Interpretasi rekaman EKG 12-lead istirahat. |

---

## 2. Variabel Pemeriksaan Harian (DCU - Daily Check-Up)

| Nama Variabel | Tipe Data | Satuan | Rentang Valid | Keterangan Klinis & Ambang Kritis |
| :--- | :---: | :---: | :---: | :--- |
| `systolic_bp` | Integer | mmHg | 70 – 250 | Peringatan jika $\ge 140$; **Kritis jika $\ge 180$ mmHg**. |
| `diastolic_bp` | Integer | mmHg | 40 – 150 | Peringatan jika $\ge 90$; **Kritis jika $\ge 120$ mmHg**. |
| `resting_heart_rate` | Integer | bpm | 40 – 160 | Bradikardia jika $< 45$; Takikardia berat jika $> 120$ bpm. |
| `spo2_percent` | Integer | % | 80 – 100 | Saturasi oksigen nadi; **Kritis jika $< 92\%$**. |
| `body_temperature_c` | Float | °C | 35.0 – 42.0 | Suhu badan sebelum shift (demam $\ge 37.8^\circ\text{C}$). |
| `sleep_hours_last_24h` | Float | Jam | 0.0 – 18.0 | Durasi tidur 24 jam terakhir (kurang jika $< 5.0$ jam). |
| `reaction_time_ms` | Integer | ms | 100 – 1000 | Waktu reaksi uji ketangkasan psikomotor (kelelahan). |
| `chest_pain_flag` | Boolean | - | `true`, `false` | Gejala nyeri dada/sesak mendadak (**Red Flag Medevac**). |
| `entry_mode` | Kategori | Enum | `SELF_SERVICE_KIOSK`, `PARAMEDIC_ASSISTED`, `BATCH_IMPORT` | Sumber kanal pencatatan data DCU. |

---

## 3. Fitur Turunan Matematika (*Engineered Features*)

1. **Pulse Pressure ($PP$)**:
   $$\text{PP} = \text{Systolic BP} - \text{Diastolic BP}$$
   *Nilai $> 60 \text{ mmHg}$ mencerminkan kekakuan arteri (*arterial stiffness*).*
2. **Mean Arterial Pressure ($MAP$)**:
   $$\text{MAP} = \text{Diastolic BP} + \frac{1}{3} (\text{Systolic BP} - \text{Diastolic BP})$$
3. **Triglyceride-to-HDL Ratio ($TG/HDL$)**:
   $$\text{TG/HDL} = \frac{\text{Triglycerides}}{\text{HDL}}$$
   *Surrogate marker resistensi insulin dan partikel LDL kecil padat (*small-dense LDL*).*
4. **Sindrom Metabolik Asia-Pasifik (Flag 0/1)**:
   * Terpenuhi jika $\ge 3$ kriteria:
     * $BMI \ge 25.0 \text{ kg/m}^2$
     * $TG \ge 150 \text{ mg/dL}$
     * $HDL < 40 \text{ mg/dL (pria)} \text{ atau } < 50 \text{ mg/dL (wanita)}$
     * $\text{TD Sistolik} \ge 130 \text{ atau Diastolik} \ge 85 \text{ mmHg}$
     * $\text{Gula Puasa} \ge 100 \text{ mg/dL}$
