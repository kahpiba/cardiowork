import { NextResponse } from 'next/server';
import { 
  POPULATION_SUMMARY, 
  getSuppressedDepartmentTable, 
  SHIFT_COMPARISON_STATS 
} from '@/lib/populationData';

export const runtime = 'nodejs';

/**
 * GET /api/population/stats
 * Mengambil ringkasan kesehatan populasi 1.000 pekerja dengan Small-Cell Suppression aktif.
 */
export async function GET() {
  try {
    const suppressedDepartments = getSuppressedDepartmentTable();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: POPULATION_SUMMARY,
      departments: suppressedDepartments,
      shiftComparison: SHIFT_COMPARISON_STATS,
      privacyCompliance: {
        regulation: 'UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP)',
        policy: 'Small-Cell Suppression (Ambang Batas Minimum N < 5)',
        status: 'ENFORCED',
        explanation: 'Sel data kesehatan dengan jumlah pekerja kurang dari 5 orang disamarkan menjadi <5* untuk mencegah re-identifikasi individu oleh pengguna berwenang.'
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error pada pengambilan data populasi', details: error.message },
      { status: 500 }
    );
  }
}
