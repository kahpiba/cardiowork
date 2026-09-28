import { NextRequest, NextResponse } from 'next/server';
import { runUnifiedInference, PredictionRequest } from '@/lib/inference/unifiedInference';
import { logAuditEvent } from '@/lib/audit';

export const runtime = 'nodejs';

/**
 * POST /api/inference/predict
 * Endpoint inferensi terpadu 3-tier: Layer 1 (Klinis), Layer 2 (LightGBM ML), Layer 3 (Multimodal DL & Autoencoder Anomaly).
 */
export async function POST(req: NextRequest) {
  try {
    const body: PredictionRequest = await req.json();

    if (!body.workerId && !body.mcuRecord) {
      return NextResponse.json(
        { error: 'Bad Request: Mohon sertakan workerId atau mcuRecord pada body request.' },
        { status: 400 }
      );
    }

    const prediction = await runUnifiedInference(body);

    // Audit Logging (UU No. 27/2022 kepatuhan akses data kesehatan)
    try {
      await logAuditEvent({
        action: 'READ',
        resourceType: 'PREDICTION_INFERENCE',
        resourceId: prediction.workerId,
        metadata: {
          recommendation: prediction.consensus.recommendation,
          concordance: prediction.consensus.concordance,
          l2Prob: prediction.layer2.highRiskProbability,
          l3Prob: prediction.layer3.cvdRiskProbability,
          isAnomaly: prediction.layer3.autoencoderAnomaly.isAnomaly,
          inferenceEngine: prediction.inferenceEngine
        }
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json(prediction, { status: 200 });
  } catch (error: any) {
    console.error('Inference prediction error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error pada pemrosesan inferensi', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inference/predict?workerId=W-00192
 * Shortcut pengujian inferensi untuk profil pekerja demo.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId') || 'W-00192';

  try {
    const prediction = await runUnifiedInference({ workerId });
    return NextResponse.json(prediction, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menjalankan inferensi demo', details: error.message },
      { status: 500 }
    );
  }
}
