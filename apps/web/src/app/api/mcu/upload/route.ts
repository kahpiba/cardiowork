import { NextRequest, NextResponse } from 'next/server';
import { McuRecordSchema } from '@cardiowork/shared';
import { recordAuditLog } from '@/lib/audit';
import { repository } from '@/db/repository';

export const runtime = 'nodejs';

interface RowValidationError {
  row: number;
  workerId?: string;
  field: string;
  message: string;
  receivedValue?: any;
}

/**
 * Endpoint Ingestion Rekam Medis MCU (Mendukung Batch & Chunked Payload)
 * Memvalidasi rentang fisiologis klinis dan mencatat audit log.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({
        success: false,
        message: 'Payload tidak valid: diharapkan array data baris MCU.'
      }, { status: 400 });
    }

    const validRecords = [];
    const errors: RowValidationError[] = [];

    // Validasi baris per baris
    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const parsed = McuRecordSchema.safeParse(rawRow);

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push({
            row: i + 1,
            workerId: rawRow.workerId || rawRow.worker_id || 'UNKNOWN',
            field: issue.path.join('.'),
            message: issue.message,
            receivedValue: rawRow[issue.path[0]]
          });
        }
      } else {
        validRecords.push(parsed.data);
      }
    }

    // Persistensi data valid ke repository database
    for (const record of validRecords) {
      const rec: any = record;
      await repository.saveMcuRecord({
        id: rec.id || `mcu-${rec.workerId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        workerId: rec.workerId,
        examinationDate: rec.examinationDate || new Date().toISOString().split('T')[0],
        heightCm: Number(rec.heightCm || 170),
        weightKg: Number(rec.weightKg || 70),
        bmi: Number(rec.bmi || (rec.weightKg / Math.pow(rec.heightCm / 100, 2)).toFixed(1)),
        waistCircumferenceCm: rec.waistCircumferenceCm ? Number(rec.waistCircumferenceCm) : undefined,
        systolicBp: Number(rec.systolicBp),
        diastolicBp: Number(rec.diastolicBp),
        restingHeartRate: Number(rec.restingHeartRate || 72),
        fastingGlucoseMgdl: Number(rec.fastingGlucoseMgdl || 100),
        hba1cPercent: rec.hba1cPercent ? Number(rec.hba1cPercent) : undefined,
        totalCholesterolMgdl: Number(rec.totalCholesterolMgdl || 200),
        ldlCholesterolMgdl: Number(rec.ldlCholesterolMgdl || 130),
        hdlCholesterolMgdl: Number(rec.hdlCholesterolMgdl || 50),
        triglyceridesMgdl: Number(rec.triglyceridesMgdl || 150),
        creatinineMgdl: rec.creatinineMgdl ? Number(rec.creatinineMgdl) : undefined,
        egfr: rec.egfr ? Number(rec.egfr) : undefined,
        uricAcidMgdl: rec.uricAcidMgdl ? Number(rec.uricAcidMgdl) : undefined,
        smokingStatus: rec.smokingStatus || 'NON_SMOKER',
        packYears: rec.packYears ? Number(rec.packYears) : 0,
        hasDiabetesHistory: Boolean(rec.hasDiabetesHistory),
        hasHypertensionHistory: Boolean(rec.hasHypertensionHistory),
        familyCardioHistory: Boolean(rec.familyCardioHistory),
        onAntihypertensiveDrugs: Boolean(rec.onAntihypertensiveDrugs),
        onStatinDrugs: Boolean(rec.onStatinDrugs),
        restingEcgInterpretation: rec.restingEcgInterpretation || 'NORMAL',
        overallFitnessStatus: rec.overallFitnessStatus || 'FIT'
      });
    }

    // Catat log audit akses
    await recordAuditLog({
      userId: req.headers.get('x-user-id') || 'paramedic-user',
      userRole: 'PARAMEDIC',
      action: 'WRITE',
      resourceAccessed: `mcu_batch_upload:${validRecords.length}_records`,
      clientIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'client-app'
    });

    return NextResponse.json({
      success: true,
      totalReceived: rows.length,
      validCount: validRecords.length,
      errorCount: errors.length,
      hasErrors: errors.length > 0,
      errors: errors.slice(0, 100), // Kembalikan sampel error untuk laporan yang dapat diunduh
      message: `Berhasil memproses ${validRecords.length} dari ${rows.length} catatan MCU.`
    }, { status: 200 });

  } catch (error: any) {
    console.error('[MCU_INGESTION_ERROR]', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memproses berkas MCU: ' + (error?.message || 'Internal Server Error')
    }, { status: 500 });
  }
}
