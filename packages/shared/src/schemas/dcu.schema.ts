import { z } from 'zod';

export const DcuRecordSchema = z.object({
  id: z.string().uuid().optional(),
  workerId: z.string().uuid(),
  recordedAt: z.string().datetime(),
  shiftType: z.enum(['DAY_SHIFT', 'NIGHT_SHIFT', 'MIDDLE_SHIFT']),
  
  // Tanda Vital Harian (Tensimeter & Oximeter & Termometer)
  systolicBp: z.number().int().min(70).max(250),
  diastolicBp: z.number().int().min(40).max(150),
  restingHeartRate: z.number().int().min(40).max(160),
  spo2Percent: z.number().int().min(80).max(100),
  bodyTemperatureC: z.number().min(35.0).max(42.0),
  
  // Gaya Hidup & Kelelahan 24 Jam Terakhir
  sleepHoursLast24h: z.number().min(0).max(18),
  caffeineIntakeCups: z.number().int().min(0).max(20).default(0),
  cigarettesTodayCount: z.number().int().min(0).max(80).default(0),
  reactionTimeMs: z.number().int().min(100).max(1000).optional(),
  
  // Skrining Gejala Subjektif (Red Flags)
  chestPainFlag: z.boolean().default(false),
  shortnessOfBreathFlag: z.boolean().default(false),
  dizzinessFlag: z.boolean().default(false),
  palpitationsFlag: z.boolean().default(false),
  
  // Mode Input (Self-Service Kiosk vs Paramedic Assisted)
  entryMode: z.enum(['SELF_SERVICE_KIOSK', 'PARAMEDIC_ASSISTED', 'BATCH_IMPORT']).default('SELF_SERVICE_KIOSK'),
  recordedByUserId: z.string().optional()
});

export type DcuRecordInput = z.infer<typeof DcuRecordSchema>;
