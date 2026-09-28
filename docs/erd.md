# Entity Relationship Diagram (ERD) — CardioWork

Dokumen ini mendefinisikan skema basis data PostgreSQL yang diterapkan pada CardioWork, yang dirancang khusus untuk memenuhi standar keandalan serverless Vercel (Neon Postgres connection pooling) dan kepatuhan privasi medis (UU PDP No. 27/2022).

---

## 1. Diagram Relasional (Mermaid)

```mermaid
erDiagram
    WORKERS ||--o{ MCU_RECORDS : "memiliki riwayat"
    WORKERS ||--o{ DCU_RECORDS : "mencatat harian"
    WORKERS ||--o{ RISK_ASSESSMENTS : "memiliki evaluasi"
    WORKERS ||--o{ ALERTS : "menerima peringatan"
    WORKERS ||--o{ CONSENTS : "memberikan persetujuan"
    
    RISK_ASSESSMENTS ||--o{ FOLLOWUPS : "memicu tindak lanjut"
    ALERTS ||--o{ FOLLOWUPS : "ditindaklanjuti"
    FOLLOWUPS ||--o{ CLINICAL_NOTES : "memiliki catatan dokter"
    
    MODEL_VERSIONS ||--o{ RISK_ASSESSMENTS : "digunakan untuk kalkulasi"
    USERS ||--o{ AUDIT_LOGS : "melakukan aksi"
    USERS ||--o{ CLINICAL_NOTES : "ditulis oleh dokter"

    WORKERS {
        uuid id PK
        string pseudonym_id UK "e.g. W-78921"
        date date_of_birth
        string gender "MALE / FEMALE"
        string department
        string job_title
        string job_hazard_category "HIGH / MEDIUM / LOW"
        string shift_pattern
        integer tenure_months
        boolean is_active
        timestamp created_at
    }

    MCU_RECORDS {
        uuid id PK
        uuid worker_id FK
        date examination_date
        float height_cm
        float weight_kg
        float bmi
        float waist_circumference_cm
        integer systolic_bp
        integer diastolic_bp
        integer resting_heart_rate
        float fasting_glucose_mgdl
        float hba1c_percent
        float total_cholesterol_mgdl
        float ldl_cholesterol_mgdl
        float hdl_cholesterol_mgdl
        float triglycerides_mgdl
        float creatinine_mgdl
        float egfr
        float uric_acid_mgdl
        string smoking_status
        float pack_years
        boolean has_diabetes_history
        boolean has_hypertension_history
        boolean family_cardio_history
        boolean on_antihypertensive_drugs
        boolean on_statin_drugs
        string resting_ecg_interpretation
        string overall_fitness_status
        timestamp created_at
    }

    DCU_RECORDS {
        uuid id PK
        uuid worker_id FK
        timestamp recorded_at "BRIN Indexed"
        string shift_type
        integer systolic_bp
        integer diastolic_bp
        integer resting_heart_rate
        integer spo2_percent
        float body_temperature_c
        float sleep_hours_last_24h
        boolean chest_pain_flag
        boolean shortness_of_breath_flag
        boolean dizziness_flag
        boolean palpitations_flag
        string daily_fitness_verdict
        string entry_mode "SELF_SERVICE_KIOSK / PARAMEDIC_ASSISTED"
        string recorded_by_user_id
    }

    MODEL_VERSIONS {
        uuid id PK
        string model_name
        string version_tag UK
        string architecture_type
        jsonb performance_metrics
        string artifact_hash
        boolean is_active_champion
        timestamp deployed_at
    }

    RISK_ASSESSMENTS {
        uuid id PK
        uuid worker_id FK
        uuid model_version_id FK
        timestamp assessment_date
        float framingham_risk_percent_10yr
        float who_searo_risk_percent_10yr
        float ascvd_risk_percent_10yr
        float ml_baseline_risk_prob
        float dl_fusion_risk_prob
        string risk_tier
        float uncertainty_lower
        float uncertainty_upper
        boolean uncertainty_flag
        jsonb shap_attributions
        jsonb temporal_weights
        string clinical_recommendation
        boolean medevac_alert_flag
        boolean reviewed_by_doctor
    }

    ALERTS {
        uuid id PK
        uuid worker_id FK
        uuid dcu_record_id FK
        timestamp triggered_at
        string severity "WARNING / CRITICAL"
        string trigger_source
        string alert_description
        boolean is_acknowledged
        timestamp acknowledged_at
    }

    FOLLOWUPS {
        uuid id PK
        uuid worker_id FK
        uuid triggered_by_alert_id FK
        uuid triggered_by_assessment_id FK
        string status
        date scheduled_date
        string work_restriction_code
    }

    CLINICAL_NOTES {
        uuid id PK
        uuid followup_id FK
        string doctor_user_id
        text encrypted_doctor_notes "AES-256-GCM"
        string final_disposition
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        string user_id
        string user_role
        string action
        string resource_accessed
        string client_ip
        string user_agent
        timestamp timestamp
    }

    CONSENTS {
        uuid id PK
        uuid worker_id FK
        string consent_type
        boolean is_granted
        timestamp consent_timestamp
        string policy_version
    }
```
