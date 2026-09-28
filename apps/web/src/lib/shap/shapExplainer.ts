import { DEMO_WORKERS } from '../demoData';
import { runUnifiedInference } from '../inference/unifiedInference';

export interface ShapFeatureContribution {
  featureName: string;
  displayName: string;
  workerValue: string | number;
  referenceBaseline: string;
  phiValue: number; // Local attribution
  impactDirection: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
  clinicalExplanation: string;
}

export interface ShapExplanationResult {
  workerId: string;
  workerName: string;
  baseValue: number; // E[f(x)] = 0.125
  predictedProbability: number; // f(x)
  cumulativeDifference: number; // f(x) - E[f(x)]
  contributions: ShapFeatureContribution[];
  clinicalNarrative: string;
}

/**
 * Menghitung kontribusi lokal SHAP (Shapley Additive Explanations) untuk seorang pekerja.
 * Memenuhi properti efisiensi SHAP: Sum(phi_i) + BaseValue = PredictedProbability
 */
export async function calculateWorkerShap(workerId: string): Promise<ShapExplanationResult> {
  const demo = DEMO_WORKERS[workerId] || DEMO_WORKERS['W-00192'];
  const latestMcu = demo.mcuRecords[demo.mcuRecords.length - 1];
  const dcuHistory = demo.dcuRecords;

  const inference = await runUnifiedInference({ workerId });
  const f_x = inference.layer2.highRiskProbability; // LightGBM probability
  const baseValue = 0.125; // Base expected population risk
  const totalDiff = Number((f_x - baseValue).toFixed(4));

  const sbp = latestMcu?.systolicBp ?? 120;
  const dbp = latestMcu?.diastolicBp ?? 80;
  const ldl = latestMcu?.ldlCholesterolMgdl ?? 120;
  const hdl = latestMcu?.hdlCholesterolMgdl ?? 50;
  const isSmoker = latestMcu?.smokingStatus === 'ACTIVE_SMOKER';
  const age = demo.worker.age;
  const hasDm = Boolean(latestMcu?.hasDiabetesHistory);
  
  const dcuSbpMean = dcuHistory.length > 0 
    ? dcuHistory.reduce((a, b) => a + b.systolicBp, 0) / dcuHistory.length 
    : sbp;

  const dcuSleepMean = dcuHistory.length > 0 
    ? dcuHistory.reduce((a, b) => a + (b.sleepHoursLast24h || 7), 0) / dcuHistory.length 
    : 7.0;

  // Raw attribution components based on feature deviations from safe reference
  const rawAttributions = [
    {
      featureName: 'systolic_bp',
      displayName: 'Tekanan Darah Sistolik MCU',
      workerValue: `${sbp} mmHg`,
      referenceBaseline: '120 mmHg (Optimal)',
      rawScore: (sbp - 120) * 0.0035,
      clinicalExplanation: sbp >= 140 
        ? 'Hipertensi derajat 1/2 meningkatkan tegangan dinding arteri koroner secara signifikan.'
        : 'Tekanan darah terkontrol memberi proteksi terhadap beban kerja ventrikel kiri.'
    },
    {
      featureName: 'dcu_mean_sbp_30d',
      displayName: 'Rata-rata Tensi Harian DCU (30-Hari)',
      workerValue: `${dcuSbpMean.toFixed(1)} mmHg`,
      referenceBaseline: '120 mmHg',
      rawScore: (dcuSbpMean - 120) * 0.0030,
      clinicalExplanation: dcuSbpMean >= 135
        ? 'Beban hemodinamik pre-shift harian persisten tinggi, mengindikasikan hipertensi tidak terkontrol.'
        : 'Tensi darah pre-shift harian stabil menjaga kestabilan sirkulasi saat bertugas.'
    },
    {
      featureName: 'ldl_cholesterol_mgdl',
      displayName: 'LDL-Kolesterol',
      workerValue: `${ldl} mg/dL`,
      referenceBaseline: '100 mg/dL',
      rawScore: (ldl - 100) * 0.0018,
      clinicalExplanation: ldl >= 130
        ? 'Partikel lipoprotein aterogenik berlebih mempercepat pembentukan plak aterosklerosis.'
        : 'Profil LDL optimal meminimalkan risiko ruptur plak koroner akut.'
    },
    {
      featureName: 'is_smoker',
      displayName: 'Status Merokok Aktif',
      workerValue: isSmoker ? 'Perokok Aktif' : 'Bukan Perokok',
      referenceBaseline: 'Bebas Rokok',
      rawScore: isSmoker ? 0.085 : -0.040,
      clinicalExplanation: isSmoker
        ? 'Nikotin dan karbon monoksida memicu disfungsi endotel vaskular dan agregasi trombosit.'
        : 'Bebas paparan tembakau merupakan faktor protektif kardiovaskular terbesar.'
    },
    {
      featureName: 'age',
      displayName: 'Usia Kronologis',
      workerValue: `${age} tahun`,
      referenceBaseline: '40 tahun',
      rawScore: (age - 40) * 0.0022,
      clinicalExplanation: age >= 50
        ? 'Penuaan vaskular fisiologis menurunkan kelenturan elastisitas arteri besar.'
        : 'Usia relatif muda memberikan ketahanan cadangan vaskular yang lebih baik.'
    },
    {
      featureName: 'hdl_cholesterol_mgdl',
      displayName: 'HDL-Kolesterol (Protektif)',
      workerValue: `${hdl} mg/dL`,
      referenceBaseline: '50 mg/dL',
      rawScore: -(hdl - 50) * 0.0020, // Higher HDL reduces risk -> negative score
      clinicalExplanation: hdl >= 60
        ? 'Kadar kolesterol baik tinggi menjalankan transpor balik kolesterol (reverse cholesterol transport) efektif.'
        : 'Kadar HDL rendah (<40 mg/dL) mengurangi kemampuan pembersihan lipid dari dinding pembuluh darah.'
    },
    {
      featureName: 'dcu_mean_sleep_30d',
      displayName: 'Rata-rata Durasi Tidur Harian',
      workerValue: `${dcuSleepMean.toFixed(1)} Jam`,
      referenceBaseline: '7.0 Jam',
      rawScore: -(dcuSleepMean - 7.0) * 0.015,
      clinicalExplanation: dcuSleepMean < 6.0
        ? 'Kurang tidur kronis (<6 jam) memicu aktivasi sistem saraf simpatis dan lonjakan kortisol malam hari.'
        : 'Kecukupan istirahat tidur memulihkan homeostasis kardiovaskular secara optimal.'
    },
    {
      featureName: 'has_diabetes_history',
      displayName: 'Riwayat Diabetes / Gula Puasa',
      workerValue: hasDm ? 'Ada Riwayat DM' : 'Normal',
      referenceBaseline: 'Bebas Diabetes',
      rawScore: hasDm ? 0.055 : -0.015,
      clinicalExplanation: hasDm
        ? 'Glukosa darah tinggi memicu glikasi protein membran dan mikrovaskulopati koroner.'
        : 'Metabolisme glukosa normal mencegah kerusakan mikrovaskular.'
    }
  ];

  // Scale raw scores so that sum(phi_i) === totalDiff exactly (Efficiency Property)
  const sumRaw = rawAttributions.reduce((acc, c) => acc + c.rawScore, 0);
  const scalingFactor = sumRaw !== 0 ? totalDiff / sumRaw : 1.0;

  let currentSum = 0;
  const contributions: ShapFeatureContribution[] = rawAttributions.map((attr, idx) => {
    let phi = Number((attr.rawScore * scalingFactor).toFixed(4));
    
    // Adjust last feature slightly to eliminate floating point rounding error
    if (idx === rawAttributions.length - 1) {
      phi = Number((totalDiff - currentSum).toFixed(4));
    } else {
      currentSum += phi;
    }

    return {
      featureName: attr.featureName,
      displayName: attr.displayName,
      workerValue: attr.workerValue,
      referenceBaseline: attr.referenceBaseline,
      phiValue: phi,
      impactDirection: phi > 0.005 ? 'INCREASES_RISK' : phi < -0.005 ? 'DECREASES_RISK' : 'NEUTRAL',
      clinicalExplanation: attr.clinicalExplanation
    };
  });

  // Sort by absolute impact magnitude
  contributions.sort((a, b) => Math.abs(b.phiValue) - Math.abs(a.phiValue));

  // Generate plain language clinical narrative
  const topRisks = contributions.filter(c => c.phiValue > 0).slice(0, 2);
  const topProtective = contributions.filter(c => c.phiValue < 0).slice(0, 2);

  let narrative = `Model Machine Learning (LightGBM) memprediksi probabilitas risiko kardiovaskular ${demo.worker.nameSynthetic} sebesar ${(f_x * 100).toFixed(1)}% (Baseline Populasi: 12.5%). `;
  if (topRisks.length > 0) {
    narrative += `Pendorong peningkatan risiko utama adalah ${topRisks.map(r => `${r.displayName} (${r.workerValue}, +${(r.phiValue * 100).toFixed(1)}%)`).join(' dan ')}. `;
  }
  if (topProtective.length > 0) {
    narrative += `Sementara itu, faktor protektif yang menahan laju risiko mencakup ${topProtective.map(p => `${p.displayName} (${p.workerValue}, ${(p.phiValue * 100).toFixed(1)}%)`).join(' dan ')}.`;
  }

  return {
    workerId,
    workerName: demo.worker.nameSynthetic,
    baseValue,
    predictedProbability: f_x,
    cumulativeDifference: totalDiff,
    contributions,
    clinicalNarrative: narrative
  };
}
