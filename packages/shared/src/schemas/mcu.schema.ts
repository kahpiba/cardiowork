import { z } from 'zod';

export const McuRecordSchema = z.object({
  id: z.string().uuid().optional(),
  workerId: z.string().uuid(),
  examinationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  
  // Antropometri
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250),
  bmi: z.number().min(14).max(60),
  waistCircumferenceCm: z.number().min(40).max(180).optional(),
  
  // Hemodinamika
  systolicBp: z.number().int().min(70).max(250),
  diastolicBp: z.number().int().min(40).max(150),
  restingHeartRate: z.number().int().min(40).max(160),
  
  // Laboratorium Darah & Kimia
  fastingGlucoseMgdl: z.number().min(50).max(450),
  hba1cPercent: z.number().min(3.5).max(16.0).optional(),
  totalCholesterolMgdl: z.number().min(80).max(500),
  ldlCholesterolMgdl: z.number().min(30).max(350),
  hdlCholesterolMgdl: z.number().min(15).max(120),
  triglyceridesMgdl: z.number().min(30).max(800),
  creatinineMgdl: z.number().min(0.2).max(15.0).optional(),
  egfr: z.number().min(5).max(150).optional(),
  uricAcidMgdl: z.number().min(1.5).max(20.0).optional(),
  
  // Riwayat & Kebiasaan
  smokingStatus: z.enum(['NON_SMOKER', 'FORMER_SMOKER', 'ACTIVE_SMOKER']),
  packYears: z.number().min(0).max(120).default(0),
  hasDiabetesHistory: z.boolean().default(false),
  hasHypertensionHistory: z.boolean().default(false),
  familyCardioHistory: z.boolean().default(false),
  onAntihypertensiveDrugs: z.boolean().default(false),
  onStatinDrugs: z.boolean().default(false),
  
  // EKG Istirahat
  restingEcgInterpretation: z.enum(['NORMAL', 'BORDERLINE', 'ABNORMAL']).default('NORMAL'),
  
  // Keputusan Klinis
  overallFitnessStatus: z.enum(['FIT', 'FIT_WITH_RESTRICTION', 'UNFIT']).default('FIT')
});

export type McuRecordInput = z.infer<typeof McuRecordSchema>;
