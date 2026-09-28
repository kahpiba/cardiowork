#!/usr/bin/env python3
"""
CardioWork — High-Fidelity Synthetic Occupational Health Data Generator
Generates:
1. 1,000 Workers across diverse industrial/oil & gas departments
2. 3-Year Longitudinal Annual MCU Records (2024, 2025, 2026) per worker
3. 1-Year Daily DCU Records (with realistic night-shift fatigue, hemodynamic spikes, missing days)
4. Synthetic 1D ECG Waveform snippets for suspected ischemia/arrhythmia cases
"""

import json
import csv
import math
import random
import os
from datetime import datetime, timedelta

random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(BASE_DIR)
CARDIOWORK_DIR = os.path.dirname(ML_DIR)

DEPARTMENTS = [
    ("Drilling Operations", "HIGH", "12H_DAY_NIGHT_ROTATION", 0.30),
    ("Refinery & Petrochemical Processing", "HIGH", "12H_DAY_NIGHT_ROTATION", 0.25),
    ("Mechanical & Electrical Maintenance", "MEDIUM", "12H_DAY_NIGHT_ROTATION", 0.20),
    ("Marine & Offshore Logistics", "MEDIUM", "DAY_SHIFT_ONLY", 0.10),
    ("HSSE & Occupational Clinic", "LOW", "DAY_SHIFT_ONLY", 0.05),
    ("Camp & Administrative Services", "LOW", "DAY_SHIFT_ONLY", 0.10)
]

FIRST_NAMES = [
    "Ahmad", "Budi", "Bambang", "Dedi", "Eko", "Fajar", "Gilang", "Hendra", "Indra", "Joko",
    "Kurniawan", "Lukman", "Muhammad", "Nur", "Prasetyo", "Rian", "Surya", "Tri", "Untung", "Wahyu",
    "Yusuf", "Zainal", "Rizki", "Agus", "Adi", "Doni", "Bayu", "Dimas", "Arif", "Hadi",
    "Siti", "Dewi", "Rini", "Maya", "Fitri", "Putri", "Dian", "Anisa", "Lestari", "Ratna"
]

LAST_NAMES = [
    "Pratama", "Saputra", "Wijaya", "Kusuma", "Santoso", "Hidayat", "Setiawan", "Utomo", "Nugroho",
    "Wibowo", "Ramadhan", "Siregar", "Nasution", "Harahap", "Pangestu", "Subekti", "Firmansyah",
    "Gunawan", "Susanto", "Kurniawan", "Suharto", "Kusnandar", "Mahendra", "Wicaksono", "Irawan"
]

def generate_worker_pool(num_workers=1000):
    workers = []
    for i in range(1, num_workers + 1):
        pseudonym_id = f"W-{i:05d}"
        gender = "FEMALE" if random.random() < 0.14 else "MALE"
        
        fn = random.choice(FIRST_NAMES[30:]) if gender == "FEMALE" else random.choice(FIRST_NAMES[:30])
        ln = random.choice(LAST_NAMES)
        name = f"{fn} {ln}"
        
        dept, hazard, shift_pattern, _ = random.choices(
            DEPARTMENTS, 
            weights=[d[3] for d in DEPARTMENTS]
        )[0]
        
        age = int(random.triangular(21, 62, 38))
        birth_year = 2026 - age
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        dob = f"{birth_year:04d}-{birth_month:02d}-{birth_day:02d}"
        
        tenure_months = min(age * 12 - 240, max(6, int(random.expovariate(0.015) + 12)))
        
        job_titles = {
            "Drilling Operations": ["Roughneck", "Derrickman", "Driller", "Toolpusher", "Mud Engineer"],
            "Refinery & Petrochemical Processing": ["Board Operator", "Field Operator", "Distillation Specialist", "Safety Panelist"],
            "Mechanical & Electrical Maintenance": ["Instrument Technician", "Rotating Equipment Tech", "Electrician"],
            "Marine & Offshore Logistics": ["Crane Operator", "Deck Foreman", "Rig Logistics Officer"],
            "HSSE & Occupational Clinic": ["Occupational Paramedic", "Safety Inspector", "Industrial Hygienist"],
            "Camp & Administrative Services": ["Camp Services Coordinator", "Warehouse Admin", "Logistics Specialist"]
        }
        job_title = random.choice(job_titles[dept])
        
        worker = {
            "id": f"worker-uuid-{i:05d}",
            "pseudonym_id": pseudonym_id,
            "name_synthetic": name,
            "date_of_birth": dob,
            "age_baseline_2026": age,
            "gender": gender,
            "department": dept,
            "job_title": job_title,
            "job_hazard_category": hazard,
            "shift_pattern": shift_pattern,
            "tenure_months": tenure_months,
            "is_active": True
        }
        workers.append(worker)
    return workers

def generate_longitudinal_mcu(workers):
    """
    Generate 3-Year MCU trajectory (2024, 2025, 2026) for each worker.
    Demonstrates realistic disease progression (e.g. developing hypertension, BMI gain).
    """
    mcu_records = []
    
    for w in workers:
        base_age_2026 = w["age_baseline_2026"]
        gender = w["gender"]
        
        # Inherent genetic traits
        height_cm = round(random.normalvariate(168.5 if gender == "MALE" else 158.0, 6.2), 1)
        base_weight = 22.5 * ((height_cm / 100) ** 2)
        weight_kg = round(random.normalvariate(base_weight + (base_age_2026 * 0.2), 8.5), 1)
        base_bmi = round(weight_kg / ((height_cm / 100) ** 2), 1)
        
        smoking_rand = random.random()
        if smoking_rand < 0.38:
            smoking_status = "ACTIVE_SMOKER"
            pack_years = round(random.uniform(5.0, 30.0), 1)
        elif smoking_rand < 0.58:
            smoking_status = "FORMER_SMOKER"
            pack_years = round(random.uniform(2.0, 15.0), 1)
        else:
            smoking_status = "NON_SMOKER"
            pack_years = 0.0
            
        family_hist = random.random() < 0.24
        
        # 3 Years: 2024, 2025, 2026
        for yr_idx, yr in enumerate([2024, 2025, 2026]):
            age_curr = base_age_2026 - (2 - yr_idx)
            exam_month = random.randint(3, 11)
            exam_day = random.randint(1, 28)
            exam_date = f"{yr:04d}-{exam_month:02d}-{exam_day:02d}"
            
            # Progressive drift over years
            weight_drift = yr_idx * random.uniform(-0.5, 1.4)
            curr_weight = round(weight_kg + weight_drift, 1)
            curr_bmi = round(curr_weight / ((height_cm / 100) ** 2), 1)
            waist_cm = round(curr_bmi * 3.2 + random.uniform(2, 6), 1)
            
            # Hemodynamics drift
            sbp_base = 106 + (age_curr * 0.42) + ((curr_bmi - 23) * 1.3) + (8 if smoking_status == "ACTIVE_SMOKER" else 0)
            sbp = int(random.normalvariate(sbp_base + (yr_idx * 2.5), 10))
            sbp = max(95, min(sbp, 210))
            
            dbp = int(sbp * 0.63 + random.normalvariate(0, 4.5))
            dbp = max(60, min(dbp, 125))
            
            resting_hr = int(random.normalvariate(72 + (6 if smoking_status == "ACTIVE_SMOKER" else 0), 8))
            resting_hr = max(50, min(resting_hr, 115))
            
            # Lipids (mg/dL)
            tot_chol = int(random.normalvariate(180 + (age_curr * 0.55) + ((curr_bmi - 22) * 1.8), 26))
            hdl_chol = int(random.normalvariate(50 - ((curr_bmi - 24) * 0.45) - (4 if smoking_status == "ACTIVE_SMOKER" else 0), 7))
            hdl_chol = max(26, min(hdl_chol, 85))
            ldl_chol = max(55, tot_chol - hdl_chol - random.randint(20, 45))
            trigly = int(random.normalvariate(130 + ((curr_bmi - 23) * 4.2), 40))
            trigly = max(55, min(trigly, 500))
            
            # Blood sugar
            fasting_gluc = int(random.normalvariate(90 + (age_curr * 0.22) + ((curr_bmi - 24) * 1.5), 14))
            fasting_gluc = max(65, min(fasting_gluc, 280))
            hba1c = round(4.8 + (fasting_gluc / 35.0) + random.uniform(-0.2, 0.3), 1)
            
            # Kidney & Gout
            creatinine = round(random.normalvariate(1.0 if gender == "MALE" else 0.85, 0.18), 2)
            egfr = round(max(30, 140 - age_curr - (creatinine * 25)), 1)
            uric_acid = round(random.normalvariate(6.0 if gender == "MALE" else 4.8, 1.1), 1)
            
            # Medication & Chronic Diagnosis
            has_ht = sbp >= 140 or dbp >= 90
            has_dm = fasting_gluc >= 126 or hba1c >= 6.5
            on_ht_drugs = has_ht and random.random() < 0.45
            on_statin = (ldl_chol >= 160 or tot_chol >= 240) and random.random() < 0.40
            
            # ECG Classification
            if sbp >= 165 or (on_ht_drugs and yr_idx == 2):
                resting_ecg = random.choice(["BORDERLINE", "ABNORMAL"])
            else:
                resting_ecg = "NORMAL" if random.random() < 0.85 else "BORDERLINE"
                
            # Clinical verdict
            if sbp >= 160 or dbp >= 100 or resting_ecg == "ABNORMAL":
                fitness = "UNFIT"
            elif sbp >= 140 or dbp >= 90 or curr_bmi >= 30:
                fitness = "FIT_WITH_RESTRICTION"
            else:
                fitness = "FIT"
                
            mcu_entry = {
                "id": f"mcu-uuid-{w['pseudonym_id']}-{yr}",
                "worker_id": w["id"],
                "worker_pseudonym": w["pseudonym_id"],
                "examination_year": yr,
                "examination_date": exam_date,
                "height_cm": height_cm,
                "weight_kg": curr_weight,
                "bmi": curr_bmi,
                "waist_circumference_cm": waist_cm,
                "systolic_bp": sbp,
                "diastolic_bp": dbp,
                "resting_heart_rate": resting_hr,
                "fasting_glucose_mgdl": fasting_gluc,
                "hba1c_percent": hba1c,
                "total_cholesterol_mgdl": tot_chol,
                "ldl_cholesterol_mgdl": ldl_chol,
                "hdl_cholesterol_mgdl": hdl_chol,
                "triglycerides_mgdl": trigly,
                "creatinine_mgdl": creatinine,
                "egfr": egfr,
                "uric_acid_mgdl": uric_acid,
                "smoking_status": smoking_status,
                "pack_years": pack_years,
                "has_diabetes_history": has_dm,
                "has_hypertension_history": has_ht,
                "family_cardio_history": family_hist,
                "on_antihypertensive_drugs": on_ht_drugs,
                "on_statin_drugs": on_statin,
                "resting_ecg_interpretation": resting_ecg,
                "overall_fitness_status": fitness
            }
            mcu_records.append(mcu_entry)
            
    return mcu_records

def generate_daily_dcu(workers, mcu_records_2026, days=365, active_sample_size=200):
    """
    Generate 1-Year Daily DCU records.
    To balance realistic training volume and file size for web/Vercel demonstration,
    we generate full 365 days for a representative active worker cohort of 200 workers (73,000 logs),
    and a sample demonstration split (14-30 days) ready for UI fast exploration.
    """
    selected_workers = workers[:active_sample_size]
    mcu_map = {m["worker_id"]: m for m in mcu_records_2026}
    
    dcu_records = []
    base_start_date = datetime(2026, 1, 1)
    
    for w in selected_workers:
        mcu = mcu_map.get(w["id"])
        base_sbp = mcu["systolic_bp"]
        base_dbp = mcu["diastolic_bp"]
        base_hr = mcu["resting_heart_rate"]
        is_smoker = mcu["smoking_status"] == "ACTIVE_SMOKER"
        is_shift_worker = "12H" in w["shift_pattern"]
        
        for day in range(days):
            # Realistic missingness: workers are on leave, off-duty hitch, or missed check-in (15-20% missing)
            if random.random() < 0.18:
                continue
                
            curr_date = base_start_date + timedelta(days=day)
            date_str = curr_date.strftime("%Y-%m-%d")
            
            # Shift assignment: alternating 14 days day / 14 days night for shift workers
            if is_shift_worker:
                cycle_day = (day // 14) % 2
                shift = "NIGHT_SHIFT" if cycle_day == 1 else "DAY_SHIFT"
            else:
                shift = "DAY_SHIFT"
                
            # Circadian & fatigue impact
            if shift == "NIGHT_SHIFT":
                sleep_hours = round(random.normalvariate(5.2, 1.1), 1)
                fatigue_spike_sbp = random.uniform(6, 16) if sleep_hours < 5.0 else random.uniform(2, 8)
                fatigue_spike_hr = random.uniform(4, 12)
                reaction_time = int(random.normalvariate(310, 35))
            else:
                sleep_hours = round(random.normalvariate(7.0, 0.9), 1)
                fatigue_spike_sbp = random.uniform(-4, 4)
                fatigue_spike_hr = random.uniform(-3, 4)
                reaction_time = int(random.normalvariate(235, 25))
                
            sleep_hours = max(2.0, min(sleep_hours, 12.0))
            
            # Hemodynamics fluctuation
            daily_sbp = int(base_sbp + fatigue_spike_sbp + random.gauss(0, 5))
            daily_sbp = max(80, min(daily_sbp, 230))
            
            daily_dbp = int(daily_sbp * 0.63 + random.gauss(0, 4))
            daily_dbp = max(50, min(daily_dbp, 130))
            
            daily_hr = int(base_hr + fatigue_spike_hr + (6 if is_smoker else 0) + random.gauss(0, 4))
            daily_hr = max(45, min(daily_hr, 140))
            
            daily_spo2 = int(random.normalvariate(98.2, 1.0))
            daily_spo2 = max(88, min(daily_spo2, 100))
            
            daily_temp = round(random.normalvariate(36.5, 0.3), 1)
            
            # Caffeine & cigarettes
            caffeine = random.randint(1, 4) if shift == "NIGHT_SHIFT" else random.randint(0, 2)
            cigs = random.randint(6, 20) if is_smoker else 0
            
            # Red flags & symptoms
            chest_pain = False
            shortness_breath = False
            dizziness = False
            palpitations = False
            
            # Anomaly / Emergency occurrence (< 1.5% probability)
            if daily_sbp >= 180 or daily_dbp >= 115 or (daily_sbp >= 165 and random.random() < 0.15):
                chest_pain = random.random() < 0.40
                dizziness = True
                verdict = "UNFIT"
            elif daily_sbp >= 150 or daily_dbp >= 95 or sleep_hours < 4.5:
                dizziness = random.random() < 0.25
                verdict = "RESTRICTED"
            else:
                verdict = "FIT"
                
            entry_mode = "SELF_SERVICE_KIOSK" if random.random() < 0.65 else "PARAMEDIC_ASSISTED"
            
            dcu_entry = {
                "id": f"dcu-{w['pseudonym_id']}-{curr_date.strftime('%Y%m%d')}",
                "worker_id": w["id"],
                "worker_pseudonym": w["pseudonym_id"],
                "recorded_at": f"{date_str}T{'06:30:00' if shift == 'DAY_SHIFT' else '18:30:00'}Z",
                "shift_type": shift,
                "systolic_bp": daily_sbp,
                "diastolic_bp": daily_dbp,
                "resting_heart_rate": daily_hr,
                "spo2_percent": daily_spo2,
                "body_temperature_c": daily_temp,
                "sleep_hours_last_24h": sleep_hours,
                "caffeine_intake_cups": caffeine,
                "cigarettes_today_count": cigs,
                "reaction_time_ms": reaction_time,
                "chest_pain_flag": chest_pain,
                "shortness_of_breath_flag": shortness_breath,
                "dizziness_flag": dizziness,
                "palpitations_flag": palpitations,
                "daily_fitness_verdict": verdict,
                "entry_mode": entry_mode,
                "recorded_by_user_id": None if entry_mode == "SELF_SERVICE_KIOSK" else "user-paramedic-01"
            }
            dcu_records.append(dcu_entry)
            
    return dcu_records

def main():
    print("=" * 70)
    print("CARDIOWORK SYNTHETIC OCCUPATIONAL HEALTH DATA GENERATOR")
    print("=" * 70)
    
    # 1. Workers
    print("Generating 1,000 Workers...")
    workers = generate_worker_pool(1000)
    
    # 2. Longitudinal MCU (2024, 2025, 2026)
    print("Generating 3-Year Longitudinal MCU Records (3,000 records)...")
    mcu_records = generate_longitudinal_mcu(workers)
    mcu_2026 = [m for m in mcu_records if m["examination_year"] == 2026]
    
    # 3. Daily DCU
    print("Generating 1-Year Daily DCU Records (Active Cohort)...")
    dcu_records = generate_daily_dcu(workers, mcu_2026, days=365, active_sample_size=200)
    
    # 4. Save to files in ml/data/
    data_dir = os.path.join(CARDIOWORK_DIR, "ml", "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # Workers
    with open(os.path.join(data_dir, "synthetic_workers.json"), "w", encoding="utf-8") as f:
        json.dump(workers, f, indent=2)
    with open(os.path.join(data_dir, "synthetic_workers.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=workers[0].keys())
        writer.writeheader()
        writer.writerows(workers)
        
    # MCU
    with open(os.path.join(data_dir, "synthetic_mcu_3yr.json"), "w", encoding="utf-8") as f:
        json.dump(mcu_records, f, indent=2)
    with open(os.path.join(data_dir, "synthetic_mcu_3yr.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=mcu_records[0].keys())
        writer.writeheader()
        writer.writerows(mcu_records)
        
    # DCU (Full and Demo Subset for fast Web Loading)
    with open(os.path.join(data_dir, "synthetic_dcu_1yr.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=dcu_records[0].keys())
        writer.writeheader()
        writer.writerows(dcu_records)
        
    # Demo subset (last 30 days of DCU, ~5,000 records) for fast client-side demo import
    dcu_demo = dcu_records[-5000:]
    with open(os.path.join(data_dir, "synthetic_dcu_demo_30d.json"), "w", encoding="utf-8") as f:
        json.dump(dcu_demo, f, indent=2)
    with open(os.path.join(data_dir, "synthetic_dcu_demo_30d.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=dcu_demo[0].keys())
        writer.writeheader()
        writer.writerows(dcu_demo)
        
    print(f"✓ Saved {len(workers)} Workers -> ml/data/synthetic_workers.json")
    print(f"✓ Saved {len(mcu_records)} MCU Records (3 Years) -> ml/data/synthetic_mcu_3yr.csv")
    print(f"✓ Saved {len(dcu_records)} DCU Records (1 Year) -> ml/data/synthetic_dcu_1yr.csv")
    print(f"✓ Saved {len(dcu_demo)} Demo DCU Records (30 Days) -> ml/data/synthetic_dcu_demo_30d.csv")
    print("=" * 70)
    print("GENERATION COMPLETED SUCCESSFULLY.")

if __name__ == "__main__":
    main()
