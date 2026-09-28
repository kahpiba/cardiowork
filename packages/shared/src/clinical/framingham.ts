/**
 * Framingham General Cardiovascular Risk Score (10-Year Risk)
 * Sumber: D'Agostino RB Sr, Vasan RS, Pencina MJ, et al.
 * "General Cardiovascular Risk Profile for Use in Primary Care: The Framingham Heart Study"
 * Circulation. 2008;117(6):743-753. doi:10.1161/CIRCULATIONAHA.107.699579
 *
 * Batasan Klinis:
 * - Rentang usia valid: 30 - 74 tahun (usia di luar rentang akan dibatasi ke batas terdekat).
 * - Kohort asli berasal dari populasi Framingham, Massachusetts (kaukasia).
 * - Berpotensi memerlukan rekalibrasi pada populasi Asia Tenggara.
 */

export interface FraminghamInput {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isTreatedForHypertension: boolean;
  totalCholesterolMgdl: number;
  hdlCholesterolMgdl: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface FraminghamResult {
  riskPercent10Yr: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH';
  basisScore: number;
  citation: string;
  clinicalLimitations: string;
}

export function calculateFraminghamCvd(input: FraminghamInput): FraminghamResult {
  // Clamp parameter ke batas fisiologis model Framingham 2008
  const age = Math.min(74, Math.max(30, input.age));
  const sbp = Math.min(200, Math.max(90, input.systolicBp));
  const totChol = Math.min(400, Math.max(100, input.totalCholesterolMgdl));
  const hdl = Math.min(100, Math.max(20, input.hdlCholesterolMgdl));
  const isSmoker = input.isSmoker ? 1 : 0;
  const isDiabetic = input.hasDiabetes ? 1 : 0;

  const lnAge = Math.log(age);
  const lnTotChol = Math.log(totChol);
  const lnHdl = Math.log(hdl);
  const lnSbp = Math.log(sbp);

  let individualSum = 0;
  let meanSum = 0;
  let baselineSurvival = 0;

  if (input.gender === 'MALE') {
    // Model Pria (Men)
    baselineSurvival = 0.88936;
    meanSum = 23.9802;

    const sbpTerm = input.isTreatedForHypertension 
      ? 1.99881 * lnSbp 
      : 1.93303 * lnSbp;

    individualSum = 
      (3.06117 * lnAge) +
      (1.12370 * lnTotChol) -
      (0.93263 * lnHdl) +
      sbpTerm +
      (0.65451 * isSmoker) +
      (0.57367 * isDiabetic);
  } else {
    // Model Wanita (Women)
    baselineSurvival = 0.95012;
    meanSum = 26.1931;

    const sbpTerm = input.isTreatedForHypertension 
      ? 2.82263 * lnSbp 
      : 2.76157 * lnSbp;

    individualSum = 
      (2.32888 * lnAge) +
      (1.20904 * lnTotChol) -
      (0.70833 * lnHdl) +
      sbpTerm +
      (0.52873 * isSmoker) +
      (0.69154 * isDiabetic);
  }

  const exponent = individualSum - meanSum;
  const risk = 1 - Math.pow(baselineSurvival, Math.exp(exponent));
  const riskPercent = Math.min(99.0, Math.max(0.5, Number((risk * 100).toFixed(1))));

  let category: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (riskPercent >= 20.0) {
    category = 'HIGH';
  } else if (riskPercent >= 10.0) {
    category = 'MODERATE';
  } else {
    category = 'LOW';
  }

  return {
    riskPercent10Yr: riskPercent,
    riskCategory: category,
    basisScore: Number(individualSum.toFixed(4)),
    citation: "Framingham General Cardiovascular Risk Profile (Circulation 2008;117:743-753)",
    clinicalLimitations: "Model dikembangkan dari populasi Kaukasia di AS; memerlukan pertimbangan klinis pada pekerja Asia Tenggara karena faktor lingkungan dan diet yang berbeda."
  };
}
