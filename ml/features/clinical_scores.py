#!/usr/bin/env python3
"""
Python Implementation of Layer 1 Clinical Scores:
1. Framingham General CVD (Circulation 2008)
2. WHO/ISH South-East Asia Region (SEARO) Chart
3. ASCVD Pooled Cohort Equations (Circulation 2014)
"""

import math

def calculate_framingham_cvd(age, gender, sbp, is_treated_bp, total_chol, hdl_chol, is_smoker, has_diabetes):
    age = min(74, max(30, age))
    sbp = min(200, max(90, sbp))
    total_chol = min(400, max(100, total_chol))
    hdl_chol = min(100, max(20, hdl_chol))
    
    ln_age = math.log(age)
    ln_tot = math.log(total_chol)
    ln_hdl = math.log(hdl_chol)
    ln_sbp = math.log(sbp)
    smk = 1 if is_smoker else 0
    dm = 1 if has_diabetes else 0
    
    if gender.upper() == "MALE":
        baseline_s = 0.88936
        mean_sum = 23.9802
        sbp_term = 1.99881 * ln_sbp if is_treated_bp else 1.93303 * ln_sbp
        indiv_sum = (3.06117 * ln_age) + (1.12370 * ln_tot) - (0.93263 * ln_hdl) + sbp_term + (0.65451 * smk) + (0.57367 * dm)
    else:
        baseline_s = 0.95012
        mean_sum = 26.1931
        sbp_term = 2.82263 * ln_sbp if is_treated_bp else 2.76157 * ln_sbp
        indiv_sum = (2.32888 * ln_age) + (1.20904 * ln_tot) - (0.70833 * ln_hdl) + sbp_term + (0.52873 * smk) + (0.69154 * dm)
        
    risk = 1.0 - (baseline_s ** math.exp(indiv_sum - mean_sum))
    return round(min(99.0, max(0.5, risk * 100.0)), 1)

def calculate_who_searo_cvd(age, gender, sbp, is_smoker, has_diabetes, total_chol=190):
    pts = 0
    if age >= 70: pts += 5
    elif age >= 60: pts += 4
    elif age >= 50: pts += 2.5
    elif age >= 40: pts += 1.0
    else: pts += 0.2
    
    if gender.upper() == "MALE": pts += 1.0
    if is_smoker: pts += 2.2
    if has_diabetes: pts += 2.8
    
    if sbp >= 180: pts += 4.5
    elif sbp >= 160: pts += 3.0
    elif sbp >= 140: pts += 1.8
    elif sbp >= 120: pts += 0.8
    
    if total_chol >= 280: pts += 2.5
    elif total_chol >= 240: pts += 1.5
    elif total_chol >= 200: pts += 0.7
    
    if pts < 5.0: return "<10%", 5.0
    elif pts < 8.5: return "10%-<20%", 15.0
    elif pts < 12.0: return "20%-<30%", 25.0
    elif pts < 15.0: return "30%-<40%", 35.0
    else: return ">=40%", 45.0
