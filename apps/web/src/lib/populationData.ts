/**
 * Data agregasi dan statistik kesehatan populasi 1.000 pekerja CardioWork.
 * Mendukung analisis risiko tingkat perusahaan dan penegakan privasi Small-Cell Suppression (UU PDP No. 27/2022).
 */

export interface DepartmentRiskData {
  department: string;
  totalWorkers: number;
  lowRisk: number;
  moderateRisk: number;
  highRisk: number;
  criticalRisk: number;
  fitCount: number;
  fitRestrictionCount: number;
  unfitCount: number;
  smokerCount: number;
  hypertensiveCount: number;
  meanAge: number;
  hazardLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryShiftPattern: string;
}

export interface SuppressedCell {
  value: string;
  isSuppressed: boolean;
  raw?: number;
}

export interface SuppressedDepartmentRow {
  department: string;
  totalWorkers: SuppressedCell;
  lowRisk: SuppressedCell;
  moderateRisk: SuppressedCell;
  highRisk: SuppressedCell;
  criticalRisk: SuppressedCell;
  fitCount: SuppressedCell;
  fitRestrictionCount: SuppressedCell;
  unfitCount: SuppressedCell;
  smokerCount: SuppressedCell;
  hypertensiveCount: SuppressedCell;
  meanAge: number;
  hazardLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ShiftComparisonData {
  shiftPattern: string;
  label: string;
  totalWorkers: number;
  highCvdRiskPercent: number;
  unfitRatePercent: number;
  meanSbpDcu: number;
  sleepHoursMean: number;
  complaintDaysPercent: number;
}

export const POPULATION_SUMMARY = {
  totalHeadcount: 1000,
  averageAge: 39.8,
  genderDistribution: {
    maleCount: 871,
    malePercent: 87.1,
    femaleCount: 129,
    femalePercent: 12.9
  },
  riskTierDistribution: [
    { tier: 'LOW', label: 'Risiko Rendah (<10%)', count: 105, percent: 10.5, color: '#10b981' },
    { tier: 'MODERATE', label: 'Risiko Sedang (10-19%)', count: 216, percent: 21.6, color: '#f59e0b' },
    { tier: 'HIGH', label: 'Risiko Tinggi (20-29%)', count: 634, percent: 63.4, color: '#f97316' },
    { tier: 'CRITICAL', label: 'Risiko Kritis (≥30%)', count: 45, percent: 4.5, color: '#ef4444' }
  ],
  fitnessDistribution: [
    { status: 'FIT', label: 'Fit to Work Penuh', count: 599, percent: 59.9, color: '#10b981' },
    { status: 'FIT_WITH_RESTRICTION', label: 'Fit dengan Catatan', count: 292, percent: 29.2, color: '#f59e0b' },
    { status: 'UNFIT', label: 'Unfit (Tunda Tugas)', count: 109, percent: 10.9, color: '#ef4444' }
  ],
  prevalenceMetrics: {
    hypertensionCount: 372,
    hypertensionPercent: 37.2,
    activeSmokersCount: 378,
    activeSmokersPercent: 37.8,
    diabetesHistoryCount: 235,
    diabetesHistoryPercent: 23.5,
    metabolicSyndromeCount: 345,
    metabolicSyndromePercent: 34.5,
    dyslipidemiaHighLdlCount: 412,
    dyslipidemiaHighLdlPercent: 41.2,
    obesityAsiaPacificCount: 421,
    obesityAsiaPacificPercent: 42.1
  }
};

export const RAW_DEPARTMENT_STATS: DepartmentRiskData[] = [
  {
    department: 'Drilling Operations',
    totalWorkers: 331,
    lowRisk: 37,
    moderateRisk: 66,
    highRisk: 211,
    criticalRisk: 17,
    fitCount: 195,
    fitRestrictionCount: 95,
    unfitCount: 41,
    smokerCount: 136,
    hypertensiveCount: 129,
    meanAge: 39.0,
    hazardLevel: 'HIGH',
    primaryShiftPattern: '12H Day/Night Rotation'
  },
  {
    department: 'Refinery & Petrochemical Processing',
    totalWorkers: 256,
    lowRisk: 30,
    moderateRisk: 52,
    highRisk: 165,
    criticalRisk: 9,
    fitCount: 153,
    fitRestrictionCount: 76,
    unfitCount: 27,
    smokerCount: 90,
    hypertensiveCount: 94,
    meanAge: 39.5,
    hazardLevel: 'HIGH',
    primaryShiftPattern: '12H Day/Night Rotation'
  },
  {
    department: 'Mechanical & Electrical Maintenance',
    totalWorkers: 179,
    lowRisk: 18,
    moderateRisk: 47,
    highRisk: 106,
    criticalRisk: 8,
    fitCount: 114,
    fitRestrictionCount: 49,
    unfitCount: 16,
    smokerCount: 63,
    hypertensiveCount: 59,
    meanAge: 40.1,
    hazardLevel: 'MEDIUM',
    primaryShiftPattern: '12H Day/Night Rotation'
  },
  {
    department: 'Marine & Offshore Logistics',
    totalWorkers: 101,
    lowRisk: 5,
    moderateRisk: 27,
    highRisk: 65,
    criticalRisk: 4, // N < 5!
    fitCount: 60,
    fitRestrictionCount: 33,
    unfitCount: 8,
    smokerCount: 40,
    hypertensiveCount: 36,
    meanAge: 40.7,
    hazardLevel: 'HIGH',
    primaryShiftPattern: '12H Day/Night Rotation'
  },
  {
    department: 'Camp & Administrative Services',
    totalWorkers: 101,
    lowRisk: 13,
    moderateRisk: 19,
    highRisk: 65,
    criticalRisk: 4, // N < 5!
    fitCount: 58,
    fitRestrictionCount: 35,
    unfitCount: 8,
    smokerCount: 37,
    hypertensiveCount: 41,
    meanAge: 41.5,
    hazardLevel: 'LOW',
    primaryShiftPattern: 'Day Shift Only'
  },
  {
    department: 'HSSE & Occupational Clinic',
    totalWorkers: 32,
    lowRisk: 2, // N < 5!
    moderateRisk: 5,
    highRisk: 22,
    criticalRisk: 3, // N < 5!
    fitCount: 19,
    fitRestrictionCount: 4, // N < 5!
    unfitCount: 9,
    smokerCount: 12,
    hypertensiveCount: 13,
    meanAge: 41.8,
    hazardLevel: 'LOW',
    primaryShiftPattern: 'Day Shift Only'
  }
];

export const SHIFT_COMPARISON_STATS: ShiftComparisonData[] = [
  {
    shiftPattern: '12H_DAY_NIGHT_ROTATION',
    label: 'Rotasi Shift 12 Jam (Siang & Malam)',
    totalWorkers: 766,
    highCvdRiskPercent: 44.8,
    unfitRatePercent: 11.5,
    meanSbpDcu: 134.8,
    sleepHoursMean: 5.8,
    complaintDaysPercent: 14.2
  },
  {
    shiftPattern: 'DAY_SHIFT_ONLY',
    label: 'Shift Siang Reguler (8 Jam Non-Rotasi)',
    totalWorkers: 234,
    highCvdRiskPercent: 36.8,
    unfitRatePercent: 9.0,
    meanSbpDcu: 128.2,
    sleepHoursMean: 7.1,
    complaintDaysPercent: 6.5
  }
];

/**
 * Menerapkan Small-Cell Suppression (Aturan Sensor Data Medis N < 5).
 * Jika 1 <= N < 5, nilai disamarkan menjadi '<5*' untuk mencegah re-identifikasi pekerja.
 */
export function suppressCell(value: number, minThreshold = 5): SuppressedCell {
  if (value > 0 && value < minThreshold) {
    return {
      value: '<5*',
      isSuppressed: true,
      raw: value
    };
  }
  return {
    value: value.toString(),
    isSuppressed: false,
    raw: value
  };
}

/**
 * Menghasilkan tabel departemen dengan proteksi small-cell suppression aktif.
 */
export function getSuppressedDepartmentTable(): SuppressedDepartmentRow[] {
  return RAW_DEPARTMENT_STATS.map(dept => ({
    department: dept.department,
    totalWorkers: suppressCell(dept.totalWorkers),
    lowRisk: suppressCell(dept.lowRisk),
    moderateRisk: suppressCell(dept.moderateRisk),
    highRisk: suppressCell(dept.highRisk),
    criticalRisk: suppressCell(dept.criticalRisk),
    fitCount: suppressCell(dept.fitCount),
    fitRestrictionCount: suppressCell(dept.fitRestrictionCount),
    unfitCount: suppressCell(dept.unfitCount),
    smokerCount: suppressCell(dept.smokerCount),
    hypertensiveCount: suppressCell(dept.hypertensiveCount),
    meanAge: dept.meanAge,
    hazardLevel: dept.hazardLevel
  }));
}
