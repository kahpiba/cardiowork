import { NextRequest, NextResponse } from 'next/server';
import { McuRecordSchema } from '@cardiowork/shared';
import { recordAuditLog } from '@/lib/audit';

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
