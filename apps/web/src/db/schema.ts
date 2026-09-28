import { pgTable, uuid, text, timestamp, boolean, integer, real, date, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -----------------------------------------------------------------------------
// 1. TABEL WORKERS (Pekerja Ter-pseudonimisai)
// -----------------------------------------------------------------------------
export const workers = pgTable('workers', {
  id: uuid('id').defaultRandom().primaryKey(),
  pseudonymId: text('pseudonym_id').notNull().unique(), // Contoh: W-78921 (Identitas terisolasi)
  dateOfBirth: date('date_of_birth').notNull(),
  gender: text('gender').notNull(), // MALE / FEMALE
  department: text('department').notNull(), // Drilling, Refinery, Subsea, Logistics, Maintenance, HSSE
  jobTitle: text('job_title').notNull(),
  jobHazardCategory: text('job_hazard_category').notNull().default('MEDIUM'), // HIGH / MEDIUM / LOW
  shiftPattern: text('shift_pattern').notNull().default('12H_DAY_NIGHT_ROTATION'),
  tenureMonths: integer('tenure_months').notNull().default(12),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// -----------------------------------------------------------------------------
// 2. TABEL MCU_RECORDS (Rekam Medis Berkala Tahunan)
// -----------------------------------------------------------------------------
export const mcuRecords = pgTable('mcu_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  examinationDate: date('examination_date').notNull(),
  
  // Antropometri
  heightCm: real('height_cm').notNull(),
  weightKg: real('weight_kg').notNull(),
  bmi: real('bmi').notNull(),
  waistCircumferenceCm: real('waist_circumference_cm'),
  
  // Hemodinamika
  systolicBp: integer('systolic_bp').notNull(),
  diastolicBp: integer('diastolic_bp').notNull(),
  restingHeartRate: integer('resting_heart_rate').notNull(),
  
  // Kimia Darah & Profil Lipid
  fastingGlucoseMgdl: real('fasting_glucose_mgdl').notNull(),
  hba1cPercent: real('hba1c_percent'),
  totalCholesterolMgdl: real('total_cholesterol_mgdl').notNull(),
  ldlCholesterolMgdl: real('ldl_cholesterol_mgdl').notNull(),
  hdlCholesterolMgdl: real('hdl_cholesterol_mgdl').notNull(),
  triglyceridesMgdl: real('triglycerides_mgdl').notNull(),
  creatinineMgdl: real('creatinine_mgdl'),
  egfr: real('egfr'),
  uricAcidMgdl: real('uric_acid_mgdl'),
  
  // Riwayat & EKG
  smokingStatus: text('smoking_status').notNull(), // NON_SMOKER / FORMER_SMOKER / ACTIVE_SMOKER
  packYears: real('pack_years').default(0),
  hasDiabetesHistory: boolean('has_diabetes_history').default(false),
  hasHypertensionHistory: boolean('has_hypertension_history').default(false),
  familyCardioHistory: boolean('family_cardio_history').default(false),
  onAntihypertensiveDrugs: boolean('on_antihypertensive_drugs').default(false),
  onStatinDrugs: boolean('on_statin_drugs').default(false),
  restingEcgInterpretation: text('resting_ecg_interpretation').default('NORMAL'),
  overallFitnessStatus: text('overall_fitness_status').default('FIT'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
  return {
    workerIdx: index('mcu_worker_idx').on(table.workerId),
    examDateIdx: index('mcu_exam_date_idx').on(table.examinationDate)
  };
});

// -----------------------------------------------------------------------------
// 3. TABEL DCU_RECORDS (Pemeriksaan Harian & Kios Mandiri)
// -----------------------------------------------------------------------------
export const dcuRecords = pgTable('dcu_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
  shiftType: text('shift_type').notNull(), // DAY_SHIFT / NIGHT_SHIFT
  
  // Tanda Vital
  systolicBp: integer('systolic_bp').notNull(),
  diastolicBp: integer('diastolic_bp').notNull(),
  restingHeartRate: integer('resting_heart_rate').notNull(),
  spo2Percent: integer('spo2_percent').notNull(),
  bodyTemperatureC: real('body_temperature_c').notNull(),
  
  // Gaya Hidup & Kelelahan
  sleepHoursLast24h: real('sleep_hours_last_24h').notNull(),
  caffeineIntakeCups: integer('caffeine_intake_cups').default(0),
  cigarettesTodayCount: integer('cigarettes_today_count').default(0),
  reactionTimeMs: integer('reaction_time_ms'),
  
  // Gejala
  chestPainFlag: boolean('chest_pain_flag').default(false),
  shortnessOfBreathFlag: boolean('shortness_of_breath_flag').default(false),
  dizzinessFlag: boolean('dizziness_flag').default(false),
  palpitationsFlag: boolean('palpitations_flag').default(false),
  
  // Status Kebugaran
  dailyFitnessVerdict: text('daily_fitness_verdict').notNull().default('FIT'), // FIT / RESTRICTED / UNFIT
  entryMode: text('entry_mode').notNull().default('SELF_SERVICE_KIOSK'), // SELF_SERVICE_KIOSK / PARAMEDIC_ASSISTED / BATCH_IMPORT
  recordedByUserId: text('recorded_by_user_id')
}, (table) => {
  return {
    // BRIN index efisien untuk time-series data DCU yang masif
    workerTimeIdx: index('dcu_worker_time_idx').on(table.workerId, table.recordedAt),
    recordedAtIdx: index('dcu_recorded_at_idx').on(table.recordedAt)
  };
});

// -----------------------------------------------------------------------------
// 4. TABEL MODEL_VERSIONS (Registri Model AI & Pelacakan Audit)
// -----------------------------------------------------------------------------
export const modelVersions = pgTable('model_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  modelName: text('model_name').notNull(),
  versionTag: text('version_tag').notNull().unique(), // e.g. v1.0.0-onnx-int8
  architectureType: text('architecture_type').notNull(), // MULTIMODAL_FUSION / GBDT / 1D_CNN
  performanceMetrics: jsonb('performance_metrics').notNull(), // AUROC, AUPRC, Brier, F1
  artifactHash: text('artifact_hash').notNull(),
  isActiveChampion: boolean('is_active_champion').default(false).notNull(),
  deployedAt: timestamp('deployed_at', { withTimezone: true }).defaultNow().notNull()
});

// -----------------------------------------------------------------------------
// 5. TABEL RISK_ASSESSMENTS (Hasil Penilaian Risiko Multi-Tier)
// -----------------------------------------------------------------------------
export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  modelVersionId: uuid('model_version_id').references(() => modelVersions.id).notNull(),
  assessmentDate: timestamp('assessment_date', { withTimezone: true }).defaultNow().notNull(),
  
  // Layer 1
  framinghamRiskPercent10Yr: real('framingham_risk_percent_10yr').notNull(),
  whoSearoRiskPercent10Yr: real('who_searo_risk_percent_10yr').notNull(),
  ascvdRiskPercent10Yr: real('ascvd_risk_percent_10yr'),
  
  // Layer 2 & 3
  mlBaselineRiskProb: real('ml_baseline_risk_prob').notNull(),
  dlFusionRiskProb: real('dl_fusion_risk_prob').notNull(),
  riskTier: text('risk_tier').notNull(), // LOW / MODERATE / HIGH / CRITICAL
  
  // Ketidakpastian & XAI
  uncertaintyLower: real('uncertainty_lower').notNull(),
  uncertaintyUpper: real('uncertainty_upper').notNull(),
  uncertaintyFlag: boolean('uncertainty_flag').default(false).notNull(),
  shapAttributions: jsonb('shap_attributions').notNull(),
  temporalWeights: jsonb('temporal_weights'),
  
  clinicalRecommendation: text('clinical_recommendation').notNull(),
  medevacAlertFlag: boolean('medevac_alert_flag').default(false).notNull(),
  reviewedByDoctor: boolean('reviewed_by_doctor').default(false).notNull()
}, (table) => {
  return {
    workerAssessmentIdx: index('risk_worker_date_idx').on(table.workerId, table.assessmentDate)
  };
});

// -----------------------------------------------------------------------------
// 6. TABEL ALERTS (Peringatan Dini Kritis & Restriksi Shift)
// -----------------------------------------------------------------------------
export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  dcuRecordId: uuid('dcu_record_id').references(() => dcuRecords.id),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
  severity: text('severity').notNull(), // WARNING / CRITICAL
  triggerSource: text('trigger_source').notNull(), // RULE_BASED / DL_ANOMALY
  alertDescription: text('alert_description').notNull(),
  isAcknowledged: boolean('is_acknowledged').default(false).notNull(),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true })
});

// -----------------------------------------------------------------------------
// 7. TABEL FOLLOWUPS & CLINICAL_NOTES (Manajemen Kasus Klinis)
// -----------------------------------------------------------------------------
export const followups = pgTable('followups', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  triggeredByAlertId: uuid('triggered_by_alert_id').references(() => alerts.id),
  triggeredByAssessmentId: uuid('triggered_by_assessment_id').references(() => riskAssessments.id),
  status: text('status').notNull().default('PENDING'), // PENDING / IN_PROGRESS / REFERRED / COMPLETED
  scheduledDate: date('scheduled_date'),
  workRestrictionCode: text('work_restriction_code') // NO_NIGHT_SHIFT / NO_HEIGHTS / LIGHT_DUTY
});

export const clinicalNotes = pgTable('clinical_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  followupId: uuid('followup_id').references(() => followups.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: text('doctor_user_id').notNull(),
  encryptedDoctorNotes: text('encrypted_doctor_notes').notNull(), // Field-Level Encrypted AES-256-GCM
  finalDisposition: text('final_disposition').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// -----------------------------------------------------------------------------
// 8. TABEL AUDIT_LOGS & CONSENTS (Kepatuhan UU PDP No. 27/2022)
// -----------------------------------------------------------------------------
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(), // READ / WRITE / EXPORT / INFERENCE
  resourceAccessed: text('resource_accessed').notNull(),
  clientIp: text('client_ip').notNull(),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull()
});

export const consents = pgTable('consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  consentType: text('consent_type').notNull(),
  isGranted: boolean('is_granted').default(true).notNull(),
  consentTimestamp: timestamp('consent_timestamp', { withTimezone: true }).defaultNow().notNull(),
  policyVersion: text('policy_version').notNull()
});
