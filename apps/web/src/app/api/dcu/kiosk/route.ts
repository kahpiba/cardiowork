import { NextRequest, NextResponse } from 'next/server';
import { runUnifiedInference } from '@/lib/inference/unifiedInference';
import { evaluateDailyAlertsForWorker } from '@/lib/alerts/alertEngine';
import { logAuditEvent } from '@/lib/audit';
import { repository } from '@/db/repository';

export const runtime = 'nodejs';

export interface KioskCheckInPayload {
  workerId: string;
  systolicBp: number;
  diastolicBp: number;
  restingHeartRate?: number;
  spo2Percent?: number;
  bodyTemperatureC?: number;
  sleepHoursLast24h?: number;
  chestPainFlag?: boolean;
  shortnessOfBreathFlag?: boolean;
  dizzinessFlag?: boolean;
  palpitationsFlag?: boolean;
}

/**
 * POST /api/dcu/kiosk
 * Menerima data skrining mandiri pre-shift pekerja dari terminal kiosk (tensimeter, termometer, oximeter).
 * Mengembalikan status kelayakan kerja (Fit/Restricted/Unfit) dan evaluasi anomali seketika.
 */
export async function POST(req: NextRequest) {
  try {
    const body: KioskCheckInPayload = await req.json();

    if (!body.workerId || body.systolicBp === undefined || body.diastolicBp === undefined) {
      return NextResponse.json(
        { error: 'Bad Request: Wajib menyertakan workerId, systolicBp, dan diastolicBp.' },
        { status: 400 }
      );
    }

    const sbp = Number(body.systolicBp);
    const dbp = Number(body.diastolicBp);
    const hr = Number(body.restingHeartRate ?? 72);
    const spo2 = Number(body.spo2Percent ?? 98);
    const temp = Number(body.bodyTemperatureC ?? 36.5);
    const sleep = Number(body.sleepHoursLast24h ?? 7);
    const chestPain = Boolean(body.chestPainFlag);
    const dyspnea = Boolean(body.shortnessOfBreathFlag);
    const dizziness = Boolean(body.dizzinessFlag);
    const palpitations = Boolean(body.palpitationsFlag);

    const dcuToday = {
      systolic_bp: sbp,
      diastolic_bp: dbp,
      resting_heart_rate: hr,
      spo2_percent: spo2,
      body_temperature_c: temp,
      sleep_hours_last_24h: sleep,
      chest_pain_flag: chestPain,
      shortness_of_breath_flag: dyspnea,
      dizziness_flag: dizziness,
      palpitations_flag: palpitations,
      recorded_at: new Date().toISOString()
    };

    // 1. Run Dynamic Inference with Today's Vitals
    const inference = await runUnifiedInference({
      workerId: body.workerId,
      dcuToday: dcuToday as any
    });

    // 2. Evaluate Real-Time Daily Alerts
    const alerts = await evaluateDailyAlertsForWorker(body.workerId, dcuToday as any);

    // 3. Determine Immediate Kiosk Fitness Verdict
    let dailyFitnessVerdict: 'FIT' | 'FIT_WITH_RESTRICTION' | 'UNFIT' = 'FIT';
    let verdictIndonesian = 'Fit untuk Bekerja Penuh (Shift Aman)';
    let badgeColor: 'emerald' | 'amber' | 'rose' = 'emerald';
    let triageSummary = 'Tanda vital pre-shift berada dalam batas normal dan pekerja menyatakan bebas dari gejala kardiovaskular akut.';
    const triageRecommendations: string[] = [];

    const hasRedAlert = alerts.some(a => a.severity === 'CRITICAL');
    const hasYellowAlert = alerts.some(a => a.severity === 'WARNING');

    if (sbp >= 160 || dbp >= 100 || spo2 < 92 || chestPain || (dizziness && hr >= 110) || hasRedAlert) {
      dailyFitnessVerdict = 'UNFIT';
      verdictIndonesian = 'UNFIT / TAHAN SEMENTARA (Jangan Masuk Shift)';
      badgeColor = 'rose';
      triageSummary = 'PERINGATAN KLINIS: Parameter tanda vital pre-shift tergolong kritis atau terdapat gejala kardiovaskular akut. Izin kerja shift DITANGGUHKAN sementara.';
      triageRecommendations.push('Lapor segera ke Paramedik / Dokter Klinik Perusahaan di Pos Medik.');
      triageRecommendations.push('Dilarang mengoperasikan alat berat, bekerja di ketinggian, atau masuk area offshore.');
      triageRecommendations.push('Lakukan pemeriksaan rekam jantung EKG dan pemantauan tensi ulang setelah istirahat berbaring 15 menit.');
    } else if (sbp >= 140 || dbp >= 90 || spo2 < 95 || hr >= 100 || hr <= 50 || sleep < 5 || dyspnea || dizziness || palpitations || hasYellowAlert) {
      dailyFitnessVerdict = 'FIT_WITH_RESTRICTION';
      verdictIndonesian = 'Fit dengan Catatan (Pantau & Evaluasi)';
      badgeColor = 'amber';
      triageSummary = 'Terdapat tanda vital ambang batas (pre-hipertensi / kelelahan / takikardia ringan). Pekerja dapat bertugas dengan pengawasan kondisi berkala.';
      triageRecommendations.push('Istirahat 15 menit di ruang ber-AC dan minumlah air putih 300-500 ml.');
      triageRecommendations.push('Hindari tugas di bawah terik matahari ekstrem tanpa rotasi istirahat reguler.');
      triageRecommendations.push('Lakukan re-evaluasi tensi darah di klinik setelah 2-4 jam bertugas.');
    } else {
      triageRecommendations.push('Parameter fisiologis stabil. Pertahankan asupan cairan dan utamakan keselamatan kerja.');
      triageRecommendations.push('Lakukan skrining mandiri DCU kembali sebelum shift kerja berikutnya.');
    }

    // 4. Log Audit Event
    try {
      await logAuditEvent({
        action: 'CREATE',
        resourceType: 'DCU_KIOSK_CHECKIN',
        resourceId: body.workerId,
        metadata: {
          sbp,
          dbp,
          hr,
          spo2,
          sleep,
          verdict: dailyFitnessVerdict,
          isAnomaly: inference.layer3.autoencoderAnomaly.isAnomaly
        }
      });

      // Simpan pemeriksaan DCU ke database
      await repository.saveDcuRecord({
        id: `dcu-kiosk-${body.workerId}-${Date.now()}`,
        workerId: body.workerId,
        recordedAt: new Date().toISOString(),
        shiftType: 'DAY_SHIFT',
        systolicBp: sbp,
        diastolicBp: dbp,
        restingHeartRate: hr,
        spo2Percent: spo2,
        bodyTemperatureC: temp,
        sleepHoursLast24h: sleep,
        chestPainFlag: chestPain,
        shortnessOfBreathFlag: dyspnea,
        dizzinessFlag: dizziness,
        palpitationsFlag: palpitations,
        dailyFitnessVerdict,
        entryMode: 'SELF_SERVICE_KIOSK',
        recordedByUserId: body.workerId
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      workerId: body.workerId,
      submittedAt: new Date().toISOString(),
      dailyFitnessVerdict,
      verdictIndonesian,
      badgeColor,
      triageSummary,
      triageRecommendations,
      alerts,
      inferenceSnapshot: {
        layer1Tier: inference.layer1.integratedClinicalTier,
        layer2Probability: inference.layer2.highRiskProbability,
        layer3Probability: inference.layer3.cvdRiskProbability,
        medevacRisk: inference.layer3.medevacUnfit1YrProbability,
        autoencoderMse: inference.layer3.autoencoderAnomaly.anomalyScoreMse,
        isAnomaly: inference.layer3.autoencoderAnomaly.isAnomaly
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('DCU Kiosk Check-In error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error pada pemrosesan DCU Kiosk', details: error.message },
      { status: 500 }
    );
  }
}
