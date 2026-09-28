import { NextRequest, NextResponse } from 'next/server';
import { DcuRecordSchema } from '@cardiowork/shared';
import { recordAuditLog } from '@/lib/audit';
import { repository } from '@/db/repository';

export const runtime = 'nodejs';

/**
 * Endpoint Ingestion Pemeriksaan Harian DCU
 * Mendukung input mandiri pekerja (Self-Service Kiosk) maupun unggah batch.
 * Secara otomatis mendeteksi tanda bahaya (Red Flags) hemodinamik.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : (body.rows ? body.rows : [body]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Payload DCU tidak boleh kosong.'
      }, { status: 400 });
    }

    const validRecords = [];
    const criticalAlerts = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const parsed = DcuRecordSchema.safeParse(raw);

      if (!parsed.success) {
        errors.push({
          row: i + 1,
          workerId: raw.workerId || raw.worker_id || 'UNKNOWN',
          errors: parsed.error.issues.map(iss => `${iss.path.join('.')}: ${iss.message}`)
        });
      } else {
        const d = parsed.data;
        validRecords.push(d);

        // Simpan ke repository database
        await repository.saveDcuRecord({
          id: d.id || `dcu-${d.workerId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          workerId: d.workerId,
          recordedAt: d.recordedAt || new Date().toISOString(),
          shiftType: d.shiftType || 'DAY_SHIFT',
          systolicBp: d.systolicBp,
          diastolicBp: d.diastolicBp,
          restingHeartRate: d.restingHeartRate,
          spo2Percent: d.spo2Percent,
          bodyTemperatureC: d.bodyTemperatureC,
          sleepHoursLast24h: d.sleepHoursLast24h,
          caffeineIntakeCups: d.caffeineIntakeCups || 0,
          cigarettesTodayCount: d.cigarettesTodayCount || 0,
          reactionTimeMs: d.reactionTimeMs,
          chestPainFlag: Boolean(d.chestPainFlag),
          shortnessOfBreathFlag: Boolean(d.shortnessOfBreathFlag),
          dizzinessFlag: Boolean(d.dizzinessFlag),
          palpitationsFlag: Boolean(d.palpitationsFlag),
          dailyFitnessVerdict: (d as any).dailyFitnessVerdict || (d.systolicBp >= 160 || d.diastolicBp >= 100 ? 'UNFIT' : d.systolicBp >= 140 ? 'FIT_WITH_RESTRICTION' : 'FIT'),
          entryMode: d.entryMode || 'BATCH_IMPORT',
          recordedByUserId: d.recordedByUserId
        });

        // Immediate Deterministic Alert Logic
        const isCriticalBp = d.systolicBp >= 180 || d.diastolicBp >= 120;
        const isHypoxia = d.spo2Percent < 92;
        const isSeverePulse = d.restingHeartRate > 120 || d.restingHeartRate < 45;
        const hasChestPain = d.chestPainFlag === true;

        if (isCriticalBp || (hasChestPain && d.systolicBp >= 150) || isHypoxia || isSeverePulse) {
          const desc = isCriticalBp 
            ? `Krisis Hipertensi: TD ${d.systolicBp}/${d.diastolicBp} mmHg`
            : (hasChestPain ? `Keluhan Nyeri Dada Akut dengan TD ${d.systolicBp}/${d.diastolicBp} mmHg` : 'Saturasi O2 Kritis / Aritmia Ekstrem');
          
          criticalAlerts.push({
            workerId: d.workerId,
            severity: 'CRITICAL',
            systolicBp: d.systolicBp,
            diastolicBp: d.diastolicBp,
            spo2Percent: d.spo2Percent,
            restingHeartRate: d.restingHeartRate,
            reason: desc
          });

          await repository.saveAlert({
            id: `alert-${d.workerId}-${Date.now()}`,
            workerId: d.workerId,
            triggeredAt: new Date().toISOString(),
            severity: 'CRITICAL',
            triggerSource: 'RULE_BASED',
            alertDescription: desc,
            isAcknowledged: false
          });
        }
      }
    }

    // Catat log audit
    await recordAuditLog({
      userId: req.headers.get('x-user-id') || 'self-service-kiosk',
      userRole: (req.headers.get('x-user-role') as any) || 'WORKER',
      action: 'WRITE',
      resourceAccessed: `dcu_ingestion:${validRecords.length}_records`,
      clientIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'kiosk-device'
    });

    return NextResponse.json({
      success: true,
      processedCount: validRecords.length,
      errorCount: errors.length,
      criticalAlertsCount: criticalAlerts.length,
      criticalAlerts,
      errors: errors.slice(0, 50),
      message: `Berhasil memproses ${validRecords.length} catatan DCU. Terdeteksi ${criticalAlerts.length} peringatan kritis.`
    }, { status: 200 });

  } catch (error: any) {
    console.error('[DCU_INGESTION_ERROR]', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memproses catatan DCU: ' + (error?.message || 'Internal Server Error')
    }, { status: 500 });
  }
}
