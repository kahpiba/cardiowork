/**
 * 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk
 * Atherosclerotic Cardiovascular Disease (ASCVD) Pooled Cohort Equations (10-Year Risk)
 * Sumber: Goff DC Jr, Lloyd-Jones DM, Bennett G, et al.
 * 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk.
 * Circulation. 2014;129(25 Suppl 2):S49-S73. doi:10.1161/01.cir.0000437741.48606.98
 *
 * PERHATIAN KLINIS WAJIB UNTUK POPULASI ASIA:
 * Panduan ACC/AHA secara eksplisit menyatakan bahwa persamaan Pooled Cohort diturunkan
 * dari kohort Kaukasia dan Afrika-Amerika. Pada populasi Asia (khususnya Asia Timur dan Tenggara),
 * kalkulator ini diketahui berpotensi mengalami OVERESTIMASI risiko hingga 30-50% jika
 * tidak dikombinasikan dengan penilaian klinis langsung oleh dokter.
 */

export interface AscvdInput {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isTreatedForHypertension: boolean;
  totalCholesterolMgdl: number;
  hdlCholesterolMgdl: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface AscvdResult {
  riskPercent10Yr: number;
  riskCategory: 'LOW' | 'BORDERLINE' | 'INTERMEDIATE' | 'HIGH';
  citation: string;
  asianOverestimationWarning: string;
}

export function calculateAscvdRisk(input: AscvdInput): AscvdResult {
  // Clamp parameters to ACC/AHA bounds (Age 20 - 79)
  const age = Math.min(79, Math.max(20, input.age));
  const sbp = Math.min(200, Math.max(90, input.systolicBp));
  const totChol = Math.min(320, Math.max(130, input.totalCholesterolMgdl));
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

  // Formula White Male / Female coefficients (standar referensi PCE non-afro)
  if (input.gender === 'MALE') {
    baselineSurvival = 0.9144;
    meanSum = 61.18;

    const sbpTerm = input.isTreatedForHypertension
      ? 1.959 * lnSbp
      : 1.916 * lnSbp;

    individualSum = 
      (12.344 * lnAge) +
      (11.853 * lnTotChol) -
      (2.664 * lnAge * lnTotChol) -
      (7.990 * lnHdl) +
      (1.769 * lnAge * lnHdl) +
      sbpTerm +
      (7.837 * isSmoker) -
      (1.795 * lnAge * isSmoker) +
      (0.658 * isDiabetic);
  } else {
    baselineSurvival = 0.9665;
    meanSum = -29.18;

    const sbpTerm = input.isTreatedForHypertension
      ? 2.019 * lnSbp
      : 1.957 * lnSbp;

    individualSum = 
      (-29.799 * lnAge) +
      (4.884 * Math.pow(lnAge, 2)) +
      (13.540 * lnTotChol) -
      (3.114 * lnAge * lnTotChol) -
      (13.578 * lnHdl) +
      (3.149 * lnAge * lnHdl) +
      sbpTerm +
      (7.574 * isSmoker) -
      (1.665 * lnAge * isSmoker) +
      (0.661 * isDiabetic);
  }

  const exponent = individualSum - meanSum;
  const risk = 1 - Math.pow(baselineSurvival, Math.exp(exponent));
  const riskPercent = Math.min(99.0, Math.max(0.1, Number((risk * 100).toFixed(1))));

  let category: 'LOW' | 'BORDERLINE' | 'INTERMEDIATE' | 'HIGH';
  if (riskPercent >= 20.0) category = 'HIGH';
  else if (riskPercent >= 7.5) category = 'INTERMEDIATE';
  else if (riskPercent >= 5.0) category = 'BORDERLINE';
  else category = 'LOW';

  return {
    riskPercent10Yr: riskPercent,
    riskCategory: category,
    citation: "2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk (Circulation 2014;129:S49-S73)",
    asianOverestimationWarning: "PENTING: Kalkulator ASCVD ACC/AHA diketahui memiliki kecenderungan overestimasi risiko pada populasi Asia. Gunakan skor WHO/ISH SEARO sebagai referensi utama regional Indonesia."
  };
}
