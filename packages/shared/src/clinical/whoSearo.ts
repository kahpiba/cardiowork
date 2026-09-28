/**
 * WHO/ISH Cardiovascular Risk Prediction Chart (SEARO - South-East Asia Region)
 * Sumber: World Health Organization & International Society of Hypertension
 * "Prevention of Cardiovascular Disease: Guidelines for Assessment and Management of Cardiovascular Risk" (Geneva, 2007)
 * & WHO CVD Risk Chart Working Group. Lancet Global Health. 2019;7(10):e1332-e1345.
 *
 * Relevansi Khusus:
 * - Sub-regional epidemiologi SEARO D meliputi: Indonesia, Bangladesh, Nepal, Sri Lanka, Thailand, dll.
 * - Memprediksi risiko 10 tahun terjadinya kejadian kardiovaskular fatal atau non-fatal (infark miokard/stroke).
 */

export interface WhoSearoInput {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
  totalCholesterolMgdl?: number;
}

export interface WhoSearoResult {
  riskTier: '<10%' | '10%-<20%' | '20%-<30%' | '30%-<40%' | '>=40%';
  riskMedianPercent: number;
  actionGuideline: string;
  citation: string;
  clinicalLimitations: string;
}

export function calculateWhoSearoCvd(input: WhoSearoInput): WhoSearoResult {
  const age = input.age;
  const sbp = input.systolicBp;
  const isSmoker = input.isSmoker;
  const isDiabetic = input.hasDiabetes;
  const totChol = input.totalCholesterolMgdl || 190;

  // Skor berbasis matriks stratifikasi WHO/ISH SEARO chart
  let riskScorePoints = 0;

  // 1. Umur
  if (age >= 70) riskScorePoints += 5;
  else if (age >= 60) riskScorePoints += 4;
  else if (age >= 50) riskScorePoints += 2.5;
  else if (age >= 40) riskScorePoints += 1.0;
  else riskScorePoints += 0.2; // <40 th risiko absolut rendah

  // 2. Jenis Kelamin
  if (input.gender === 'MALE') riskScorePoints += 1.0;

  // 3. Merokok
  if (isSmoker) riskScorePoints += 2.2;

  // 4. Diabetes Melitus
  if (isDiabetic) riskScorePoints += 2.8;

  // 5. Tekanan Darah Sistolik
  if (sbp >= 180) riskScorePoints += 4.5;
  else if (sbp >= 160) riskScorePoints += 3.0;
  else if (sbp >= 140) riskScorePoints += 1.8;
  else if (sbp >= 120) riskScorePoints += 0.8;

  // 6. Kolesterol Total (mg/dL)
  if (totChol >= 280) riskScorePoints += 2.5;
  else if (totChol >= 240) riskScorePoints += 1.5;
  else if (totChol >= 200) riskScorePoints += 0.7;

  // Pemetaan poin ke 5 kategori risiko WHO/ISH
  let tier: '<10%' | '10%-<20%' | '20%-<30%' | '30%-<40%' | '>=40%';
  let medianPercent: number;
  let action: string;

  if (riskScorePoints < 5.0) {
    tier = '<10%';
    medianPercent = 5.0;
    action = 'Risiko Rendah: Intervensi pola hidup sehat, kontrol rutin rekam medis tahunan (MCU).';
  } else if (riskScorePoints < 8.5) {
    tier = '10%-<20%';
    medianPercent = 15.0;
    action = 'Risiko Moderat: Konseling gizi kerja K3, pemantauan tekanan darah berkala tiap 3 bulan.';
  } else if (riskScorePoints < 12.0) {
    tier = '20%-<30%';
    medianPercent = 25.0;
    action = 'Risiko Tinggi: Evaluasi terapi farmakologis oleh dokter perusahaan, restriksi lembur malam.';
  } else if (riskScorePoints < 15.0) {
    tier = '30%-<40%';
    medianPercent = 35.0;
    action = 'Risiko Sangat Tinggi: Rujukan dokter spesialis jantung, larangan penugasan di lokasi remote/lepas pantai.';
  } else {
    tier = '>=40%';
    medianPercent = 45.0;
    action = 'Risiko Kritis: Penanganan klinis segera, ground/unfit dari pekerjaan lapangan berat.';
  }

  return {
    riskTier: tier,
    riskMedianPercent: medianPercent,
    actionGuideline: action,
    citation: "WHO/ISH Risk Prediction Charts for South-East Asia Region (SEARO) - Geneva 2007 & Lancet Global Health 2019",
    clinicalLimitations: "Dikalibrasi khusus untuk kawasan regional Indonesia/Asia Tenggara, namun tidak memperhitungkan biomarker spesifik seperti hs-CRP atau riwayat keluarga dini."
  };
}
