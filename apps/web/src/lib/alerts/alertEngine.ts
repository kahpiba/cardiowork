import { DEMO_WORKERS } from '../demoData';
import { RawDcuRecord } from '../features/featurePipeline';
import { runUnifiedInference } from '../inference/unifiedInference';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY';

export type AlertCategory = 
  | 'HEMODYNAMIC' 
  | 'PHYSIOLOGICAL_ANOMALY' 
  | 'OXYGENATION' 
  | 'RHYTHM' 
  | 'FATIGUE' 
  | 'DISCORDANCE';

export interface DailyAlert {
  id: string;
  workerId: string;
  workerName: string;
  department: string;
  jobHazardCategory: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  triggerValues: {
    metric: string;
    currentValue: string | number;
    threshold: string | number;
  };
  recommendedAction: string;
  fitVerdictImpact: 'UNFIT' | 'FIT_WITH_RESTRICTION' | 'FIT';
}

/**
 * Mengevaluasi seluruh aturan deteksi dini risiko kardiovaskular akut untuk seorang pekerja.
 */
export async function evaluateDailyAlertsForWorker(
  workerId: string,
  dcuTodayInput?: RawDcuRecord
): Promise<DailyAlert[]> {
  const alerts: DailyAlert[] = [];
  const demo = DEMO_WORKERS[workerId];
  if (!demo) return alerts;

  const now = new Date().toISOString();
  const dcuHistory = [...demo.dcuRecords];
  
  // Use today's input or latest DCU
  let latestDcu: any = dcuTodayInput;
  if (!latestDcu && dcuHistory.length > 0) {
    latestDcu = dcuHistory[dcuHistory.length - 1];
  }

  if (!latestDcu) return alerts;

  const sbp = Number(latestDcu.systolic_bp ?? latestDcu.systolicBp ?? 120);
  const dbp = Number(latestDcu.diastolic_bp ?? latestDcu.diastolicBp ?? 80);
  const hr = Number(latestDcu.resting_heart_rate ?? latestDcu.restingHeartRate ?? 72);
  const spo2 = Number(latestDcu.spo2_percent ?? latestDcu.spo2Percent ?? 98);
  const sleep = Number(latestDcu.sleep_hours_last_24h ?? latestDcu.sleepHoursLast24h ?? 7);
  const hasChestPain = Boolean(latestDcu.chest_pain_flag ?? latestDcu.chestPainFlag);
  const hasDyspnea = Boolean(latestDcu.shortness_of_breath_flag ?? latestDcu.shortnessOfBreathFlag);
  const hasDizziness = Boolean(latestDcu.dizziness_flag ?? latestDcu.dizzinessFlag);
  const hasPalpitations = Boolean(latestDcu.palpitations_flag ?? latestDcu.palpitationsFlag);

  // Baseline 7-Day SBP average
  const last7 = dcuHistory.slice(-7);
  const sbp7Values = last7.map((d: any) => Number(d.systolic_bp ?? d.systolicBp ?? sbp));
  const sbp7Mean = sbp7Values.length > 0 
    ? sbp7Values.reduce((a, b) => a + b, 0) / sbp7Values.length 
    : sbp;
  const sbpSpike = sbp - sbp7Mean;

  // 1. Rule 1: CRITICAL_BP_SPIKE
  if (sbp >= 180 || dbp >= 110) {
    alerts.push({
      id: `alert-bp-crisis-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'CRITICAL',
      category: 'HEMODYNAMIC',
      title: 'KRISIS HIPERTENSI AKUT (Stage 3 / Crisis)',
      description: `Tekanan darah terdeteksi ${sbp}/${dbp} mmHg, melampaui batas darurat kardiovaskular. Berisiko tinggi terjadi stroke, diseksi aorta, atau infark miokard akut pre-shift.`,
      triggerValues: {
        metric: 'Tekanan Darah',
        currentValue: `${sbp}/${dbp} mmHg`,
        threshold: '≥ 180/110 mmHg'
      },
      recommendedAction: 'Dilarang bekerja (UNFIT segera). Bawa kru ke klinik lapangan untuk evaluasi EKG dan obat antihipertensi sublingual/parenteral.',
      fitVerdictImpact: 'UNFIT'
    });
  } else if (sbp >= 160 || dbp >= 100) {
    alerts.push({
      id: `alert-bp-stage2-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'CRITICAL',
      category: 'HEMODYNAMIC',
      title: 'Hipertensi Derajat 2 Pre-Shift',
      description: `Tekanan darah terdeteksi ${sbp}/${dbp} mmHg sebelum shift kerja.`,
      triggerValues: {
        metric: 'Tekanan Darah',
        currentValue: `${sbp}/${dbp} mmHg`,
        threshold: '≥ 160/100 mmHg'
      },
      recommendedAction: 'Istirahatkan pekerja di ruang tenang selama 15-30 menit, berikan hidrasi, dan periksa tensi ulang sebelum izin kerja diterbitkan.',
      fitVerdictImpact: 'UNFIT'
    });
  } else if (sbpSpike >= 20) {
    alerts.push({
      id: `alert-bp-spike-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'WARNING',
      category: 'HEMODYNAMIC',
      title: 'Lonjakan Tensi Mendadak (Sudden BP Spike)',
      description: `Tensi sistolik (${sbp} mmHg) melonjak +${sbpSpike.toFixed(1)} mmHg di atas rata-rata baseline 7-hari (${sbp7Mean.toFixed(1)} mmHg).`,
      triggerValues: {
        metric: 'Delta Sistolik 7-Hari',
        currentValue: `+${sbpSpike.toFixed(1)} mmHg`,
        threshold: '≥ +20 mmHg'
      },
      recommendedAction: 'Eksplorasi pemicu stres akut, kurang tidur, atau penghentian obat antihipertensi mandiri. Batasi tugas fisik berat.',
      fitVerdictImpact: 'FIT_WITH_RESTRICTION'
    });
  }

  // 2. Rule 2: HYPOXEMIA_ALERT
  if (spo2 < 92) {
    alerts.push({
      id: `alert-spo2-critical-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'CRITICAL',
      category: 'OXYGENATION',
      title: 'Hipoksemia Sedang-Berat (<92%)',
      description: `Saturasi oksigen darah terukur ${spo2}%. Berisiko hipoksia jaringan miokardium atau gangguan respirasi akut.`,
      triggerValues: {
        metric: 'SpO2',
        currentValue: `${spo2}%`,
        threshold: '< 92%'
      },
      recommendedAction: 'Tahan pekerja, berikan oksigen nasal kanul bila tersedia, dan larang memasuki ruang terbatas (confined space) atau ketinggian.',
      fitVerdictImpact: 'UNFIT'
    });
  } else if (spo2 < 95) {
    alerts.push({
      id: `alert-spo2-warning-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'WARNING',
      category: 'OXYGENATION',
      title: 'Saturasi Oksigen Sub-Optimal (<95%)',
      description: `Saturasi oksigen darah ${spo2}% berada di bawah batas normal optimal (95-100%).`,
      triggerValues: {
        metric: 'SpO2',
        currentValue: `${spo2}%`,
        threshold: '< 95%'
      },
      recommendedAction: 'Periksa ulang posisi probe oximeter. Hindari paparan gas buang atau uap hidrokarbon di area kerja.',
      fitVerdictImpact: 'FIT_WITH_RESTRICTION'
    });
  }

  // 3. Rule 3: RESTING_TACHYCARDIA_ARRHYTHMIA
  if (hr >= 100 || hr <= 50) {
    const isBrady = hr <= 50;
    const isSymptomatic = hasChestPain || hasPalpitations || hasDizziness;
    alerts.push({
      id: `alert-rhythm-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: isSymptomatic ? 'CRITICAL' : 'WARNING',
      category: 'RHYTHM',
      title: isBrady ? 'Bradikardia Istirahat (<50 bpm)' : 'Takikardia Istirahat (≥100 bpm)',
      description: `Denyut nadi istirahat tercatat ${hr} bpm${isSymptomatic ? ' disertai keluhan subjektif (nyeri dada/pusing/berdebar)' : ''}.`,
      triggerValues: {
        metric: 'Resting Heart Rate',
        currentValue: `${hr} bpm`,
        threshold: isBrady ? '≤ 50 bpm' : '≥ 100 bpm'
      },
      recommendedAction: isSymptomatic 
        ? 'Lakukan rekam EKG segera untuk menyingkirkan aritmia berbahaya atau sindrom koroner akut.'
        : 'Cek hidrasi tubuh, asupan kafein berlebih, dan evaluasi suhu tubuh pekerja.',
      fitVerdictImpact: isSymptomatic ? 'UNFIT' : 'FIT_WITH_RESTRICTION'
    });
  }

  // 4. Rule 4: HIGH_HAZARD_SHIFT_FATIGUE
  if (sleep < 5.0 && (demo.worker.shiftPattern.includes('ROTATION') || demo.worker.jobHazardCategory === 'HIGH')) {
    alerts.push({
      id: `alert-fatigue-${workerId}-${Date.now()}`,
      workerId,
      workerName: demo.worker.nameSynthetic,
      department: demo.worker.department,
      jobHazardCategory: demo.worker.jobHazardCategory,
      timestamp: now,
      severity: 'WARNING',
      category: 'FATIGUE',
      title: 'Peringatan Kelelahan Kritis (Sleep Deprivation)',
      description: `Pekerja hanya tidur ${sleep} jam dalam 24 jam terakhir pada pos kerja berisiko tinggi (${demo.worker.jobTitle}). Kelelahan berat meningkatkan risiko insiden kerja dan aritmia akibat lonjakan katekolamin.`,
      triggerValues: {
        metric: 'Jam Tidur 24 Jam',
        currentValue: `${sleep} Jam`,
        threshold: '< 5.0 Jam'
      },
      recommendedAction: 'Terapkan protokol manajemen kelelahan (FRMS): larang mengemudi kendaraan berat atau bekerja di ketinggian. Jadwalkan istirahat tambahan.',
      fitVerdictImpact: 'FIT_WITH_RESTRICTION'
    });
  }

  // 5. Rule 5: Autoencoder Anomaly & Multimodal Discordance Check
  try {
    const inference = await runUnifiedInference({
      workerId,
      dcuToday: latestDcu
    });

    if (inference.layer3.autoencoderAnomaly.isAnomaly) {
      alerts.push({
        id: `alert-autoencoder-${workerId}-${Date.now()}`,
        workerId,
        workerName: demo.worker.nameSynthetic,
        department: demo.worker.department,
        jobHazardCategory: demo.worker.jobHazardCategory,
        timestamp: now,
        severity: 'CRITICAL',
        category: 'PHYSIOLOGICAL_ANOMALY',
        title: 'Deteksi Anomali Fisiologis Akut (Deep Learning Autoencoder)',
        description: `Model Autoencoder mendeteksi rekonstruksi biomarker fisiologis menyimpang jauh dari baseline pekerja sehat (Skor MSE: ${inference.layer3.autoencoderAnomaly.anomalyScoreMse.toFixed(4)} vs ambang batas: ${inference.layer3.autoencoderAnomaly.threshold}). Menandakan instabilitas hemodinamik kompleks.`,
        triggerValues: {
          metric: 'Autoencoder MSE Loss',
          currentValue: inference.layer3.autoencoderAnomaly.anomalyScoreMse.toFixed(4),
          threshold: `> ${inference.layer3.autoencoderAnomaly.threshold}`
        },
        recommendedAction: 'Konsultasikan segera dengan dokter spesialis okupasi/jantung. Pemeriksaan laboratorium dan EKG komprehensif sangat disarankan.',
        fitVerdictImpact: 'UNFIT'
      });
    }

    if (inference.consensus.concordance === 'DISCORDANT_CAVEAT') {
      alerts.push({
        id: `alert-discordance-${workerId}-${Date.now()}`,
        workerId,
        workerName: demo.worker.nameSynthetic,
        department: demo.worker.department,
        jobHazardCategory: demo.worker.jobHazardCategory,
        timestamp: now,
        severity: 'ADVISORY',
        category: 'DISCORDANCE',
        title: 'Diskordansi Klinis vs Machine Learning',
        description: `Skor klinis tahunan (Layer 1) tampak stabil, namun model Layer 2 (LightGBM) & Layer 3 (Multimodal DL) mendeteksi peningkatan risiko kardiovaskular signifikan dari data harian pre-shift.`,
        triggerValues: {
          metric: 'Probabilitas ML/DL vs Formula Baku',
          currentValue: `${(inference.layer3.cvdRiskProbability * 100).toFixed(1)}% DL Risk`,
          threshold: '> 35% Risk Threshold'
        },
        recommendedAction: 'Lakukan pemantauan tensi harian mandiri (DCU Kiosk) selama 2 minggu untuk verifikasi tren longitudinal.',
        fitVerdictImpact: 'FIT_WITH_RESTRICTION'
      });
    }
  } catch {
    // Ignore inference error during alert check
  }

  return alerts;
}

/**
 * Mengambil seluruh peringatan aktif harian dari semua pekerja demo terdaftar.
 */
export async function getAllActiveDailyAlerts(): Promise<DailyAlert[]> {
  const allAlerts: DailyAlert[] = [];
  const workerIds = Object.keys(DEMO_WORKERS);

  for (const wid of workerIds) {
    const alerts = await evaluateDailyAlertsForWorker(wid);
    allAlerts.push(...alerts);
  }

  // Sort by severity (CRITICAL first, then WARNING, then ADVISORY)
  const severityRank: Record<AlertSeverity, number> = {
    CRITICAL: 0,
    WARNING: 1,
    ADVISORY: 2
  };

  return allAlerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
