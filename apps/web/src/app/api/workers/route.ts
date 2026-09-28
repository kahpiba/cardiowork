import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/db/repository';
import { logAuditEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const department = searchParams.get('department') || '';
    const hazard = searchParams.get('hazard') || '';

    const allWorkers = await repository.getAllWorkers();
    
    // Ambil MCU terbaru untuk setiap pekerja guna menghitung ringkasan risiko
    const enriched = await Promise.all(allWorkers.map(async (w) => {
      const mcus = await repository.getMcuRecordsByWorkerId(w.id);
      const dcus = await repository.getDcuRecordsByWorkerId(w.id, 1);
      const latestMcu = mcus[mcus.length - 1];
      const latestDcu = dcus[0];

      let riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (latestMcu) {
        if (latestMcu.systolicBp >= 160 || (latestMcu.totalCholesterolMgdl >= 260 && latestMcu.hasDiabetesHistory)) {
          riskTier = 'CRITICAL';
        } else if (latestMcu.systolicBp >= 140 || latestMcu.totalCholesterolMgdl >= 240) {
          riskTier = 'HIGH';
        } else if (latestMcu.systolicBp >= 130 || latestMcu.smokingStatus === 'ACTIVE_SMOKER') {
          riskTier = 'MODERATE';
        }
      }

      return {
        ...w,
        mcuCount: mcus.length,
        latestMcuDate: latestMcu?.examinationDate || null,
        latestBp: latestMcu ? `${latestMcu.systolicBp}/${latestMcu.diastolicBp}` : null,
        latestFitness: latestMcu?.overallFitnessStatus || 'FIT',
        latestDcuVerdict: latestDcu?.dailyFitnessVerdict || 'FIT',
        riskTier
      };
    }));

    // Filter
    let filtered = enriched;
    if (search) {
      filtered = filtered.filter(w => 
        w.pseudonymId.toLowerCase().includes(search) || 
        w.nameSynthetic.toLowerCase().includes(search) ||
        w.jobTitle.toLowerCase().includes(search)
      );
    }
    if (department && department !== 'ALL') {
      filtered = filtered.filter(w => w.department === department);
    }
    if (hazard && hazard !== 'ALL') {
      filtered = filtered.filter(w => w.jobHazardCategory === hazard);
    }

    // Catat log audit akses baca daftar pekerja
    const currentUser = req.headers.get('x-user-id') || 'demo-paramedic';
    const currentRole = (req.headers.get('x-user-role') as any) || 'PARAMEDIC';
    await logAuditEvent({
      userId: currentUser,
      userRole: currentRole,
      action: 'READ',
      resourceType: 'WORKER_ROSTER',
      resourceId: `count_${filtered.length}`
    });

    return NextResponse.json({
      success: true,
      total: filtered.length,
      workers: filtered
    });
  } catch (error: any) {
    console.error('Failed to fetch workers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error pada pemanggilan data pekerja', details: error.message },
      { status: 500 }
    );
  }
}
