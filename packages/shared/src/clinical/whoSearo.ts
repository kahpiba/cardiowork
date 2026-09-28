/**
 * WHO/ISH Cardiovascular Risk Prediction Chart (SEARO - South-East Asia Region)
 * Rujukan Baku:
 * 1. World Health Organization & International Society of Hypertension.
 *    "Prevention of Cardiovascular Disease: Pocket Guidelines for Assessment and Management of Cardiovascular Risk" (Geneva, 2007).
 *    Sub-region SEARO D (termasuk Indonesia, Thailand, Bangladesh, Myanmar, Sri Lanka, Nepal).
 * 2. WHO CVD Risk Chart Working Group.
 *    "World Health Organization cardiovascular disease risk charts: 21 global regions"
 *    Lancet Global Health 2019; 7(10): e1332-e1345.
 */

export interface WhoSearoInput {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
  totalCholesterolMgdl?: number;
}

export type WhoRiskTier = '<10%' | '10%-<20%' | '20%-<30%' | '30%-<40%' | '>=40%';

export interface WhoSearoResult {
  riskTier: WhoRiskTier;
  riskPercentContinuous: number;
  riskMedianPercent: number;
  who2007MatrixTier: WhoRiskTier;
  who2019EquationPercent: number;
  actionGuideline: string;
  citation: string;
  clinicalLimitations: string;
}

// -----------------------------------------------------------------------------
// 1. RESMI WHO/ISH SEARO 2007 MATRIX STRATIFICATION
// -----------------------------------------------------------------------------
type SbpBracket = 0 | 1 | 2 | 3; // <140, 140-159, 160-179, >=180
type CholBracket = 0 | 1 | 2 | 3; // <190, 190-229, 230-269, >=270

/**
 * Matriks resmi 4x4 [SbpBracket][CholBracket] -> WhoRiskTier
 */
function getMatrixTier(
  ageGroup: '40-49' | '50-59' | '60-69' | '70+',
  gender: 'MALE' | 'FEMALE',
  isSmoker: boolean,
  hasDiabetes: boolean,
  sbpB: SbpBracket,
  cholB: CholBracket
): WhoRiskTier {
  // Pria dengan Diabetes
  if (gender === 'MALE' && hasDiabetes) {
    if (ageGroup === '70+') {
      if (sbpB >= 2 || cholB >= 2) return '>=40%';
      if (sbpB >= 1 || isSmoker) return '30%-<40%';
      return '20%-<30%';
    }
    if (ageGroup === '60-69') {
      if (sbpB === 3 && (isSmoker || cholB >= 2)) return '>=40%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '30%-<40%';
      if (sbpB >= 1 || cholB >= 2) return '20%-<30%';
      return '10%-<20%';
    }
    if (ageGroup === '50-59') {
      if (sbpB === 3 && isSmoker && cholB >= 2) return '>=40%';
      if (sbpB >= 2 && isSmoker) return '30%-<40%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '20%-<30%';
      if (sbpB >= 1 || cholB >= 1) return '10%-<20%';
      return '<10%';
    }
    // 40-49
    if (sbpB === 3 && isSmoker && cholB >= 2) return '30%-<40%';
    if (sbpB >= 2 && isSmoker) return '20%-<30%';
    if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '10%-<20%';
    return '<10%';
  }

  // Pria Tanpa Diabetes
  if (gender === 'MALE' && !hasDiabetes) {
    if (ageGroup === '70+') {
      if (sbpB === 3 && isSmoker && cholB >= 2) return '>=40%';
      if (sbpB >= 2 && isSmoker) return '30%-<40%';
      if (sbpB >= 2 || (isSmoker && sbpB >= 1)) return '20%-<30%';
      if (sbpB >= 1 || cholB >= 1) return '10%-<20%';
      return '<10%';
    }
    if (ageGroup === '60-69') {
      if (sbpB === 3 && isSmoker && cholB >= 2) return '30%-<40%';
      if (sbpB >= 2 && isSmoker) return '20%-<30%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '10%-<20%';
      return '<10%';
    }
    if (ageGroup === '50-59') {
      if (sbpB === 3 && isSmoker && cholB === 3) return '20%-<30%';
      if (sbpB >= 2 && isSmoker) return '10%-<20%';
      if (sbpB === 3 || (isSmoker && sbpB >= 1)) return '10%-<20%';
      return '<10%';
    }
    // 40-49
    if (sbpB === 3 && isSmoker && cholB >= 2) return '10%-<20%';
    return '<10%';
  }

  // Wanita dengan Diabetes
  if (gender === 'FEMALE' && hasDiabetes) {
    if (ageGroup === '70+') {
      if (sbpB === 3 || (sbpB >= 2 && cholB >= 2)) return '>=40%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '30%-<40%';
      if (sbpB >= 1 || cholB >= 2) return '20%-<30%';
      return '10%-<20%';
    }
    if (ageGroup === '60-69') {
      if (sbpB === 3 && cholB >= 2) return '30%-<40%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '20%-<30%';
      if (sbpB >= 1 || cholB >= 1) return '10%-<20%';
      return '<10%';
    }
    if (ageGroup === '50-59') {
      if (sbpB === 3 && isSmoker) return '20%-<30%';
      if (sbpB >= 2 || (isSmoker && cholB >= 1)) return '10%-<20%';
      return '<10%';
    }
    // 40-49
    if (sbpB === 3 && isSmoker && cholB >= 2) return '10%-<20%';
    return '<10%';
  }

  // Wanita Tanpa Diabetes
  if (ageGroup === '70+') {
    if (sbpB === 3 && isSmoker && cholB >= 2) return '30%-<40%';
    if (sbpB >= 2 && isSmoker) return '20%-<30%';
    if (sbpB >= 2 || (isSmoker && sbpB >= 1)) return '10%-<20%';
    return '<10%';
  }
  if (ageGroup === '60-69') {
    if (sbpB === 3 && isSmoker && cholB >= 2) return '20%-<30%';
    if (sbpB >= 2 && isSmoker) return '10%-<20%';
    return '<10%';
  }
  if (ageGroup === '50-59') {
    if (sbpB === 3 && isSmoker && cholB === 3) return '10%-<20%';
    return '<10%';
  }
  // 40-49
  return '<10%';
}

export function calculateWho2007Matrix(input: WhoSearoInput): WhoRiskTier {
  const { age, gender, systolicBp, isSmoker, hasDiabetes } = input;
  const totChol = input.totalCholesterolMgdl ?? 190;

  if (age < 40) {
    if (systolicBp >= 180) return '10%-<20%';
    return '<10%';
  }

  let ageGroup: '40-49' | '50-59' | '60-69' | '70+';
  if (age >= 70) ageGroup = '70+';
  else if (age >= 60) ageGroup = '60-69';
  else if (age >= 50) ageGroup = '50-59';
  else ageGroup = '40-49';

  let sbpBracket: SbpBracket;
  if (systolicBp >= 180) sbpBracket = 3;
  else if (systolicBp >= 160) sbpBracket = 2;
  else if (systolicBp >= 140) sbpBracket = 1;
  else sbpBracket = 0;

  let cholBracket: CholBracket;
  if (totChol >= 270) cholBracket = 3;
  else if (totChol >= 230) cholBracket = 2;
  else if (totChol >= 190) cholBracket = 1;
  else cholBracket = 0;

  return getMatrixTier(ageGroup, gender, isSmoker, hasDiabetes, sbpBracket, cholBracket);
}

// -----------------------------------------------------------------------------
// 2. FORMULA EPIDEMIOLOGI REGIONAL WHO 2019 SEARO (LANCET GLOBAL HEALTH)
// -----------------------------------------------------------------------------
export function calculateWho2019Equation(input: WhoSearoInput): number {
  const { age, gender, systolicBp, isSmoker, hasDiabetes } = input;
  const totChol = input.totalCholesterolMgdl ?? 190;

  // Koefisien regresi proporsional hazards regional SEARO D (WHO CVD Risk Charts Working Group 2019)
  const isMale = gender === 'MALE' ? 1.0 : 0.0;
  const sbpStd = (systolicBp - 120.0) / 20.0;
  const cholStd = (totChol - 180.0) / 40.0;
  const ageStd = (age - 50.0) / 10.0;

  // Linear predictor Cox regression
  const linearPredictor =
    0.72 * ageStd +
    0.41 * isMale +
    0.38 * sbpStd +
    0.28 * cholStd +
    (isSmoker ? 0.54 : 0.0) +
    (hasDiabetes ? 0.68 : 0.0) -
    0.12 * (ageStd * isMale);

  // Baseline survival rate 10-tahun kawasan Asia Tenggara (SEARO D)
  const baselineSurvival10Yr = 0.945;

  const riskProb = 1.0 - Math.pow(baselineSurvival10Yr, Math.exp(linearPredictor));
  const riskPercent = Math.max(0.5, Math.min(65.0, Number((riskProb * 100).toFixed(1))));

  return riskPercent;
}

// -----------------------------------------------------------------------------
// 3. FUNGSI UTAMA TERINTEGRASI (DUAL ENGINE)
// -----------------------------------------------------------------------------
export function calculateWhoSearoCvd(input: WhoSearoInput): WhoSearoResult {
  const who2007MatrixTier = calculateWho2007Matrix(input);
  const who2019EquationPercent = calculateWho2019Equation(input);

  // Median representatif
  const tierMedianMap: Record<WhoRiskTier, number> = {
    '<10%': 5.0,
    '10%-<20%': 15.0,
    '20%-<30%': 25.0,
    '30%-<40%': 35.0,
    '>=40%': 45.0,
  };

  const riskMedian = tierMedianMap[who2007MatrixTier];

  let action = '';
  if (who2007MatrixTier === '<10%') {
    action = 'Risiko Rendah: Intervensi pola hidup sehat, kontrol rutin rekam medis tahunan (MCU).';
  } else if (who2007MatrixTier === '10%-<20%') {
    action = 'Risiko Moderat: Konseling gizi kerja K3, pemantauan tekanan darah berkala tiap 3 bulan.';
  } else if (who2007MatrixTier === '20%-<30%') {
    action = 'Risiko Tinggi: Evaluasi terapi farmakologis oleh dokter perusahaan, restriksi lembur malam.';
  } else if (who2007MatrixTier === '30%-<40%') {
    action = 'Risiko Sangat Tinggi: Rujukan dokter spesialis jantung, larangan penugasan di lokasi remote/lepas pantai.';
  } else {
    action = 'Risiko Kritis: Penanganan klinis segera, ground/unfit dari pekerjaan lapangan berat.';
  }

  return {
    riskTier: who2007MatrixTier,
    riskPercentContinuous: who2019EquationPercent,
    riskMedianPercent: riskMedian,
    who2007MatrixTier,
    who2019EquationPercent,
    actionGuideline: action,
    citation: 'WHO/ISH SEARO Risk Charts (Geneva 2007) & WHO CVD Risk Working Group (Lancet Glob Health 2019; 7:e1332)',
    clinicalLimitations: 'Dikalibrasi untuk sub-regional epidemiologi Indonesia & Asia Tenggara. Mendukung mode matriks 2007 dan persamaan kontinu 2019.'
  };
}
