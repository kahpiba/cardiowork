import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    status: 'healthy',
    system: 'CardioWork Occupational Health Platform',
    version: '0.1.0-phase1',
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    inferenceMode: process.env.INFERENCE_MODE || 'onnx-node',
    services: {
      web: 'online',
      serverlessEngine: 'ready',
      database: process.env.DATABASE_URL ? 'configured' : 'mock/unconfigured'
    },
    message: 'CardioWork API health check passed.'
  }, { status: 200 });
}
