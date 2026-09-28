import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/db/repository';
import { logAuditEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await repository.getWorkerById(params.id);
    if (!worker) {
      return NextResponse.json({ error: 'Pekerja tidak ditemukan' }, { status: 404 });
    }

    const mcuRecords = await repository.getMcuRecordsByWorkerId(worker.id);
    const dcuRecords = await repository.getDcuRecordsByWorkerId(worker.id, 60);

    // Kepatuhan Permenkes No. 24/2022: Catat log audit saat rekam medis perorangan dibuka
    const currentUser = req.headers.get('x-user-id') || 'demo-doctor';
    const currentRole = (req.headers.get('x-user-role') as any) || 'OCCUPATIONAL_DOCTOR';
    await logAuditEvent({
      userId: currentUser,
      userRole: currentRole,
      action: 'READ',
      resourceType: 'MEDICAL_RECORD',
      resourceId: worker.pseudonymId
    });

    return NextResponse.json({
      success: true,
      worker,
      mcuRecords,
      dcuRecords
    });
  } catch (error: any) {
    console.error('Failed to get worker details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
