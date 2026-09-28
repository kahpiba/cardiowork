export * from './framingham.js';
export * from './whoSearo.js';
export * from './ascvd.js';

import { calculateFraminghamCvd, type FraminghamInput } from './framingham.js';
import { calculateWhoSearoCvd, type WhoSearoInput } from './whoSearo.js';
import { calculateAscvdRisk, type AscvdInput } from './ascvd.js';

export interface ComprehensiveClinicalEvaluation {
  framingham: ReturnType<typeof calculateFraminghamCvd>;
  whoSearo: ReturnType<typeof calculateWhoSearoCvd>;
  ascvd: ReturnType<typeof calculateAscvdRisk>;
  integratedRiskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  clinicalSummaryText: string;
}

/**
 * Menghitung seluruh skor klinis baku Layer 1 secara terpadu.
 */
export function evaluateAllClinicalScores(input: FraminghamInput): ComprehensiveClinicalEvaluation {
  const framingham = calculateFraminghamCvd(input);
  
  const whoSearo = calculateWhoSearoCvd({
    age: input.age,
    gender: input.gender,
    systolicBp: input.systolicBp,
    isSmoker: input.isSmoker,
    hasDiabetes: input.hasDiabetes,
    totalCholesterolMgdl: input.totalCholesterolMgdl
  });

  const ascvd = calculateAscvdRisk(input);

  // Menentukan tier terintegrasi
  let tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (whoSearo.riskTier === '>=40%' || framingham.riskPercent10Yr >= 30.0) {
    tier = 'CRITICAL';
  } else if (whoSearo.riskTier === '30%-<40%' || whoSearo.riskTier === '20%-<30%' || framingham.riskPercent10Yr >= 20.0) {
    tier = 'HIGH';
  } else if (whoSearo.riskTier === '10%-<20%' || framingham.riskPercent10Yr >= 10.0) {
    tier = 'MODERATE';
  } else {
    tier = 'LOW';
  }

  const summary = `Evaluasi Klinis Layer 1: Framingham 10-Tahun ${framingham.riskPercent10Yr}% (${framingham.riskCategory}), WHO/ISH SEARO Kategori ${whoSearo.riskTier}. Prioritaskan kriteria WHO/ISH untuk populasi Indonesia.`;

  return {
    framingham,
    whoSearo,
    ascvd,
    integratedRiskTier: tier,
    clinicalSummaryText: summary
  };
}
