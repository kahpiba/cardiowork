import fs from 'fs';
import path from 'path';
import { db } from './index';
import { workers, mcuRecords, dcuRecords, auditLogs, alerts, riskAssessments } from './schema';
import { eq, desc } from 'drizzle-orm';
import { DEMO_WORKERS, DemoWorkerData } from '../lib/demoData';

export interface WorkerEntity {
  id: string;
  pseudonymId: string;
  nameSynthetic: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  department: string;
  jobTitle: string;
  jobHazardCategory: string;
  shiftPattern: string;
  tenureMonths: number;
  isActive: boolean;
  age?: number;
}

export interface McuEntity {
  id: string;
  workerId: string;
  examinationDate: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  waistCircumferenceCm?: number;
  systolicBp: number;
  diastolicBp: number;
  restingHeartRate: number;
  fastingGlucoseMgdl: number;
  hba1cPercent?: number;
  totalCholesterolMgdl: number;
  ldlCholesterolMgdl: number;
  hdlCholesterolMgdl: number;
  triglyceridesMgdl: number;
  creatinineMgdl?: number;
  egfr?: number;
  uricAcidMgdl?: number;
  smokingStatus: string;
  packYears?: number;
  hasDiabetesHistory: boolean;
  hasHypertensionHistory: boolean;
  familyCardioHistory: boolean;
  onAntihypertensiveDrugs: boolean;
  onStatinDrugs: boolean;
  restingEcgInterpretation: string;
  overallFitnessStatus: string;
}

export interface DcuEntity {
  id: string;
  workerId: string;
  recordedAt: string;
  shiftType: string;
  systolicBp: number;
  diastolicBp: number;
  restingHeartRate: number;
  spo2Percent: number;
  bodyTemperatureC: number;
  sleepHoursLast24h: number;
  caffeineIntakeCups?: number;
  cigarettesTodayCount?: number;
  reactionTimeMs?: number;
  chestPainFlag: boolean;
  shortnessOfBreathFlag: boolean;
  dizzinessFlag: boolean;
  palpitationsFlag: boolean;
  dailyFitnessVerdict: string;
  entryMode: string;
  recordedByUserId?: string;
}

export interface AlertEntity {
  id: string;
  workerId: string;
  dcuRecordId?: string;
  triggeredAt: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  triggerSource: 'RULE_BASED' | 'DL_ANOMALY';
  alertDescription: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

interface LocalStore {
  workers: WorkerEntity[];
  mcuRecords: McuEntity[];
  dcuRecords: DcuEntity[];
  alerts: AlertEntity[];
  auditLogs: any[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function isPostgresActive(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes('dummy') && !url.includes('localhost:5432/cardiowork'));
}

let inMemoryStore: LocalStore | null = null;

function initializeDefaultData(): LocalStore {
  const initialWorkers: WorkerEntity[] = [];
  const initialMcu: McuEntity[] = [];
  const initialDcu: DcuEntity[] = [];

  // Seed dari 3 arketipe komprehensif
  Object.values(DEMO_WORKERS).forEach((archetype: DemoWorkerData) => {
    const w = archetype.worker;
    const birthYear = 2026 - w.age;
    initialWorkers.push({
      id: w.id,
      pseudonymId: w.pseudonymId,
      nameSynthetic: w.nameSynthetic,
      dateOfBirth: `${birthYear}-05-15`,
      gender: w.gender,
      department: w.department,
      jobTitle: w.jobTitle,
      jobHazardCategory: w.jobHazardCategory,
      shiftPattern: w.shiftPattern,
      tenureMonths: w.tenureMonths,
      isActive: w.isActive,
      age: w.age
    });

    archetype.mcuRecords.forEach((m, idx) => {
      initialMcu.push({
        id: m.id || `${w.id}-mcu-${idx}`,
        workerId: w.id,
        examinationDate: m.examinationDate,
        heightCm: m.heightCm,
        weightKg: m.weightKg,
        bmi: m.bmi,
        waistCircumferenceCm: m.waistCircumferenceCm,
        systolicBp: m.systolicBp,
        diastolicBp: m.diastolicBp,
        restingHeartRate: m.restingHeartRate,
        fastingGlucoseMgdl: m.fastingGlucoseMgdl,
        hba1cPercent: m.hba1cPercent,
        totalCholesterolMgdl: m.totalCholesterolMgdl,
        ldlCholesterolMgdl: m.ldlCholesterolMgdl,
        hdlCholesterolMgdl: m.hdlCholesterolMgdl,
        triglyceridesMgdl: m.triglyceridesMgdl,
        creatinineMgdl: m.creatinineMgdl,
        egfr: m.egfr,
        uricAcidMgdl: m.uricAcidMgdl,
        smokingStatus: m.smokingStatus,
        packYears: m.packYears,
        hasDiabetesHistory: Boolean(m.hasDiabetesHistory),
        hasHypertensionHistory: Boolean(m.hasHypertensionHistory),
        familyCardioHistory: Boolean(m.familyCardioHistory),
        onAntihypertensiveDrugs: Boolean(m.onAntihypertensiveDrugs),
        onStatinDrugs: Boolean(m.onStatinDrugs),
        restingEcgInterpretation: m.restingEcgInterpretation || 'NORMAL',
        overallFitnessStatus: m.overallFitnessStatus || 'FIT'
      });
    });

    archetype.dcuRecords.forEach((d, idx) => {
      initialDcu.push({
        id: d.id || `${w.id}-dcu-${idx}`,
        workerId: w.id,
        recordedAt: d.recordedAt,
        shiftType: d.shiftType,
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
        entryMode: d.entryMode || 'SELF_SERVICE_KIOSK',
        recordedByUserId: d.recordedByUserId
      });
    });
  });

  // Tambahkan pekerja tambahan untuk melengkapi daftar direktori departemen
  const additionalWorkers: Array<Partial<WorkerEntity> & { age: number }> = [
    { pseudonymId: 'W-00201', nameSynthetic: 'Budi Santoso', age: 42, gender: 'MALE', department: 'Refinery Process', jobTitle: 'Panel Operator', jobHazardCategory: 'MEDIUM', shiftPattern: '12H_DAY_NIGHT_ROTATION', tenureMonths: 48 },
    { pseudonymId: 'W-00202', nameSynthetic: 'Dewi Lestari', age: 36, gender: 'FEMALE', department: 'HSSE & Medical', jobTitle: 'Safety Inspector', jobHazardCategory: 'LOW', shiftPattern: 'DAY_SHIFT_ONLY', tenureMonths: 24 },
    { pseudonymId: 'W-00203', nameSynthetic: 'Ahmad Fauzi', age: 52, gender: 'MALE', department: 'Subsea Engineering', jobTitle: 'Diving Supervisor', jobHazardCategory: 'HIGH', shiftPattern: '12H_DAY_NIGHT_ROTATION', tenureMonths: 72 },
    { pseudonymId: 'W-00204', nameSynthetic: 'Rina Kusuma', age: 29, gender: 'FEMALE', department: 'Logistics & Supply', jobTitle: 'Warehouse Officer', jobHazardCategory: 'LOW', shiftPattern: 'DAY_SHIFT_ONLY', tenureMonths: 14 },
    { pseudonymId: 'W-00205', nameSynthetic: 'Bambang Irawan', age: 47, gender: 'MALE', department: 'Maintenance & Reliability', jobTitle: 'Mechanical Tech', jobHazardCategory: 'MEDIUM', shiftPattern: '12H_DAY_NIGHT_ROTATION', tenureMonths: 60 }
  ];

  additionalWorkers.forEach((aw, i) => {
    const id = `worker-uuid-ext-${i + 1}`;
    const birthYear = 2026 - aw.age;
    initialWorkers.push({
      id,
      pseudonymId: aw.pseudonymId!,
      nameSynthetic: aw.nameSynthetic!,
      dateOfBirth: `${birthYear}-08-20`,
      gender: aw.gender!,
      department: aw.department!,
      jobTitle: aw.jobTitle!,
      jobHazardCategory: aw.jobHazardCategory!,
      shiftPattern: aw.shiftPattern!,
      tenureMonths: aw.tenureMonths!,
      isActive: true,
      age: aw.age
    });

    initialMcu.push({
      id: `${id}-mcu-2026`,
      workerId: id,
      examinationDate: '2026-06-15',
      heightCm: 168,
      weightKg: 70,
      bmi: 24.8,
      systolicBp: 124,
      diastolicBp: 82,
      restingHeartRate: 70,
      fastingGlucoseMgdl: 95,
      totalCholesterolMgdl: 195,
      ldlCholesterolMgdl: 120,
      hdlCholesterolMgdl: 52,
      triglyceridesMgdl: 140,
      smokingStatus: 'NON_SMOKER',
      hasDiabetesHistory: false,
      hasHypertensionHistory: false,
      familyCardioHistory: false,
      onAntihypertensiveDrugs: false,
      onStatinDrugs: false,
      restingEcgInterpretation: 'NORMAL',
      overallFitnessStatus: 'FIT'
    });
  });

  return {
    workers: initialWorkers,
    mcuRecords: initialMcu,
    dcuRecords: initialDcu,
    alerts: [
      {
        id: 'alert-initial-01',
        workerId: 'worker-uuid-00189',
        triggeredAt: new Date().toISOString(),
        severity: 'CRITICAL',
        triggerSource: 'RULE_BASED',
        alertDescription: 'Tekanan darah pre-shift terdeteksi 168/102 mmHg dengan keluhan palpitasi. Rekomendasi: Tunda shift kerja & rujuk ke klinik site.',
        isAcknowledged: false
      }
    ],
    auditLogs: []
  };
}

function getStore(): LocalStore {
  if (inMemoryStore) return inMemoryStore;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      inMemoryStore = JSON.parse(data);
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn('Gagal membaca store lokal dari disk, menggunakan in-memory default:', err);
  }

  inMemoryStore = initializeDefaultData();
  saveStore(inMemoryStore);
  return inMemoryStore;
}

function saveStore(store: LocalStore) {
  inMemoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    // Di lingkungan serverless read-only (misal Vercel tanpa write fs), inMemoryStore tetap aman selama siklus hidup worker
  }
}

// -----------------------------------------------------------------------------
// REPOSITORY METHODS
// -----------------------------------------------------------------------------

export const repository = {
  async getAllWorkers(): Promise<WorkerEntity[]> {
    if (isPostgresActive()) {
      try {
        const rows = await db.select().from(workers);
        return rows.map(r => ({
          ...r,
          nameSynthetic: `Pekerja ${r.pseudonymId}`,
          age: 2026 - new Date(r.dateOfBirth).getFullYear()
        })) as WorkerEntity[];
      } catch (e) {
        console.error('Postgres error, fallback to local store:', e);
      }
    }
    return getStore().workers;
  },

  async getWorkerById(idOrPseudonym: string): Promise<WorkerEntity | null> {
    const list = await this.getAllWorkers();
    const found = list.find(w => w.id === idOrPseudonym || w.pseudonymId === idOrPseudonym);
    return found || null;
  },

  async getMcuRecordsByWorkerId(workerId: string): Promise<McuEntity[]> {
    if (isPostgresActive()) {
      try {
        const rows = await db.select().from(mcuRecords).where(eq(mcuRecords.workerId, workerId));
        return rows as unknown as McuEntity[];
      } catch (e) {
        console.error('Postgres error, fallback to local store:', e);
      }
    }
    const store = getStore();
    return store.mcuRecords.filter(m => m.workerId === workerId);
  },

  async getDcuRecordsByWorkerId(workerId: string, limit: number = 30): Promise<DcuEntity[]> {
    if (isPostgresActive()) {
      try {
        const rows = await db.select().from(dcuRecords)
          .where(eq(dcuRecords.workerId, workerId))
          .orderBy(desc(dcuRecords.recordedAt))
          .limit(limit);
        return rows as unknown as DcuEntity[];
      } catch (e) {
        console.error('Postgres error, fallback to local store:', e);
      }
    }
    const store = getStore();
    return store.dcuRecords
      .filter(d => d.workerId === workerId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, limit);
  },

  async saveWorker(workerData: WorkerEntity): Promise<WorkerEntity> {
    const store = getStore();
    const existingIndex = store.workers.findIndex(w => w.id === workerData.id || w.pseudonymId === workerData.pseudonymId);
    if (existingIndex >= 0) {
      store.workers[existingIndex] = { ...store.workers[existingIndex], ...workerData };
    } else {
      store.workers.push(workerData);
    }
    saveStore(store);

    if (isPostgresActive()) {
      try {
        await db.insert(workers).values({
          id: workerData.id,
          pseudonymId: workerData.pseudonymId,
          dateOfBirth: workerData.dateOfBirth,
          gender: workerData.gender,
          department: workerData.department,
          jobTitle: workerData.jobTitle,
          jobHazardCategory: workerData.jobHazardCategory,
          shiftPattern: workerData.shiftPattern,
          tenureMonths: workerData.tenureMonths,
          isActive: workerData.isActive
        }).onConflictDoNothing();
      } catch (e) {
        console.error('Failed to sync worker to Postgres:', e);
      }
    }
    return workerData;
  },

  async saveMcuRecord(record: McuEntity): Promise<McuEntity> {
    const store = getStore();
    store.mcuRecords.push(record);
    saveStore(store);

    if (isPostgresActive()) {
      try {
        await db.insert(mcuRecords).values(record as any);
      } catch (e) {
        console.error('Failed to sync MCU to Postgres:', e);
      }
    }
    return record;
  },

  async saveDcuRecord(record: DcuEntity): Promise<DcuEntity> {
    const store = getStore();
    store.dcuRecords.push(record);
    saveStore(store);

    if (isPostgresActive()) {
      try {
        await db.insert(dcuRecords).values(record as any);
      } catch (e) {
        console.error('Failed to sync DCU to Postgres:', e);
      }
    }
    return record;
  },

  async getAlerts(workerId?: string): Promise<AlertEntity[]> {
    const store = getStore();
    if (workerId) {
      return store.alerts.filter(a => a.workerId === workerId);
    }
    return store.alerts;
  },

  async saveAlert(alert: AlertEntity): Promise<AlertEntity> {
    const store = getStore();
    store.alerts.unshift(alert);
    saveStore(store);
    return alert;
  },

  async saveAuditLog(log: any): Promise<void> {
    const store = getStore();
    store.auditLogs.unshift(log);
    saveStore(store);

    if (isPostgresActive()) {
      try {
        await db.insert(auditLogs).values(log);
      } catch (e) {
        console.error('Failed to sync audit log to Postgres:', e);
      }
    }
  }
};
