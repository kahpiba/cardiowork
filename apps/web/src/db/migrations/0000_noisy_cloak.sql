CREATE TABLE IF NOT EXISTS "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"dcu_record_id" uuid,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"severity" text NOT NULL,
	"trigger_source" text NOT NULL,
	"alert_description" text NOT NULL,
	"is_acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"action" text NOT NULL,
	"resource_accessed" text NOT NULL,
	"client_ip" text NOT NULL,
	"user_agent" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"followup_id" uuid NOT NULL,
	"doctor_user_id" text NOT NULL,
	"encrypted_doctor_notes" text NOT NULL,
	"final_disposition" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"consent_type" text NOT NULL,
	"is_granted" boolean DEFAULT true NOT NULL,
	"consent_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"policy_version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dcu_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"shift_type" text NOT NULL,
	"systolic_bp" integer NOT NULL,
	"diastolic_bp" integer NOT NULL,
	"resting_heart_rate" integer NOT NULL,
	"spo2_percent" integer NOT NULL,
	"body_temperature_c" real NOT NULL,
	"sleep_hours_last_24h" real NOT NULL,
	"caffeine_intake_cups" integer DEFAULT 0,
	"cigarettes_today_count" integer DEFAULT 0,
	"reaction_time_ms" integer,
	"chest_pain_flag" boolean DEFAULT false,
	"shortness_of_breath_flag" boolean DEFAULT false,
	"dizziness_flag" boolean DEFAULT false,
	"palpitations_flag" boolean DEFAULT false,
	"daily_fitness_verdict" text DEFAULT 'FIT' NOT NULL,
	"entry_mode" text DEFAULT 'SELF_SERVICE_KIOSK' NOT NULL,
	"recorded_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "followups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"triggered_by_alert_id" uuid,
	"triggered_by_assessment_id" uuid,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"scheduled_date" date,
	"work_restriction_code" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcu_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"examination_date" date NOT NULL,
	"height_cm" real NOT NULL,
	"weight_kg" real NOT NULL,
	"bmi" real NOT NULL,
	"waist_circumference_cm" real,
	"systolic_bp" integer NOT NULL,
	"diastolic_bp" integer NOT NULL,
	"resting_heart_rate" integer NOT NULL,
	"fasting_glucose_mgdl" real NOT NULL,
	"hba1c_percent" real,
	"total_cholesterol_mgdl" real NOT NULL,
	"ldl_cholesterol_mgdl" real NOT NULL,
	"hdl_cholesterol_mgdl" real NOT NULL,
	"triglycerides_mgdl" real NOT NULL,
	"creatinine_mgdl" real,
	"egfr" real,
	"uric_acid_mgdl" real,
	"smoking_status" text NOT NULL,
	"pack_years" real DEFAULT 0,
	"has_diabetes_history" boolean DEFAULT false,
	"has_hypertension_history" boolean DEFAULT false,
	"family_cardio_history" boolean DEFAULT false,
	"on_antihypertensive_drugs" boolean DEFAULT false,
	"on_statin_drugs" boolean DEFAULT false,
	"resting_ecg_interpretation" text DEFAULT 'NORMAL',
	"overall_fitness_status" text DEFAULT 'FIT',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_name" text NOT NULL,
	"version_tag" text NOT NULL,
	"architecture_type" text NOT NULL,
	"performance_metrics" jsonb NOT NULL,
	"artifact_hash" text NOT NULL,
	"is_active_champion" boolean DEFAULT false NOT NULL,
	"deployed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "model_versions_version_tag_unique" UNIQUE("version_tag")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "risk_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"model_version_id" uuid NOT NULL,
	"assessment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"framingham_risk_percent_10yr" real NOT NULL,
	"who_searo_risk_percent_10yr" real NOT NULL,
	"ascvd_risk_percent_10yr" real,
	"ml_baseline_risk_prob" real NOT NULL,
	"dl_fusion_risk_prob" real NOT NULL,
	"risk_tier" text NOT NULL,
	"uncertainty_lower" real NOT NULL,
	"uncertainty_upper" real NOT NULL,
	"uncertainty_flag" boolean DEFAULT false NOT NULL,
	"shap_attributions" jsonb NOT NULL,
	"temporal_weights" jsonb,
	"clinical_recommendation" text NOT NULL,
	"medevac_alert_flag" boolean DEFAULT false NOT NULL,
	"reviewed_by_doctor" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pseudonym_id" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" text NOT NULL,
	"department" text NOT NULL,
	"job_title" text NOT NULL,
	"job_hazard_category" text DEFAULT 'MEDIUM' NOT NULL,
	"shift_pattern" text DEFAULT '12H_DAY_NIGHT_ROTATION' NOT NULL,
	"tenure_months" integer DEFAULT 12 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workers_pseudonym_id_unique" UNIQUE("pseudonym_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_dcu_record_id_dcu_records_id_fk" FOREIGN KEY ("dcu_record_id") REFERENCES "public"."dcu_records"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_followup_id_followups_id_fk" FOREIGN KEY ("followup_id") REFERENCES "public"."followups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consents" ADD CONSTRAINT "consents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dcu_records" ADD CONSTRAINT "dcu_records_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followups" ADD CONSTRAINT "followups_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followups" ADD CONSTRAINT "followups_triggered_by_alert_id_alerts_id_fk" FOREIGN KEY ("triggered_by_alert_id") REFERENCES "public"."alerts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followups" ADD CONSTRAINT "followups_triggered_by_assessment_id_risk_assessments_id_fk" FOREIGN KEY ("triggered_by_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcu_records" ADD CONSTRAINT "mcu_records_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_model_version_id_model_versions_id_fk" FOREIGN KEY ("model_version_id") REFERENCES "public"."model_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dcu_worker_time_idx" ON "dcu_records" USING btree ("worker_id","recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dcu_recorded_at_idx" ON "dcu_records" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcu_worker_idx" ON "mcu_records" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcu_exam_date_idx" ON "mcu_records" USING btree ("examination_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "risk_worker_date_idx" ON "risk_assessments" USING btree ("worker_id","assessment_date");