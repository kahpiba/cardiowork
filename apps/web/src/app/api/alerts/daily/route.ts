import { NextRequest, NextResponse } from 'next/server';
import { evaluateDailyAlertsForWorker, getAllActiveDailyAlerts } from '@/lib/alerts/alertEngine';

export const runtime = 'nodejs';

/**
 * GET /api/alerts/daily
 * Mengambil daftar peringatan aktif harian (lonjakan tensi, anomali autoencoder, hipoksemia, kelelahan).
 * Parameter opsional: ?workerId=W-00192
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');

  try {
    const alerts = workerId 
      ? await evaluateDailyAlertsForWorker(workerId)
      : await getAllActiveDailyAlerts();

    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
    const advisoryCount = alerts.filter(a => a.severity === 'ADVISORY').length;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      workerId: workerId || 'ALL_REGISTERED_WORKERS',
      totalAlerts: alerts.length,
      criticalCount,
      warningCount,
      advisoryCount,
      alerts
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get daily alerts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error pada pengambilan daily alerts', details: error.message },
      { status: 500 }
    );
  }
}
