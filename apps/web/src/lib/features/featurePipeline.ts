import featureSpec from '../../../../../packages/shared/feature_spec.json';

export interface RawMcuRecord {
  age?: number;
  gender?: string;
  bmi?: number;
  systolic_bp?: number;
  systolicBp?: number;
  diastolic_bp?: number;
  diastolicBp?: number;
  resting_heart_rate?: number;
  restingHeartRate?: number;
  fasting_glucose?: number;
  fastingGlucoseMgdl?: number;
  total_cholesterol?: number;
  totalCholesterolMgdl?: number;
  hdl_cholesterol?: number;
  hdlCholesterolMgdl?: number;
  ldl_cholesterol?: number;
  ldlCholesterolMgdl?: number;
  triglycerides?: number;
  triglyceridesMgdl?: number;
  smoking_status?: string;
  smokingStatus?: string;
  resting_ecg?: string;
  restingEcgInterpretation?: string;
}

export interface RawDcuRecord {
  systolic_bp?: number;
  systolicBp?: number;
  diastolic_bp?: number;
  diastolicBp?: number;
  sleep_hours_last_24h?: number;
  sleepHoursLast24h?: number;
  chest_pain_flag?: boolean;
  chestPainFlag?: boolean;
  shortness_of_breath_flag?: boolean;
  shortnessOfBreathFlag?: boolean;
  dizziness_flag?: boolean;
  dizzinessFlag?: boolean;
  daily_fitness_verdict?: string;
  dailyFitnessVerdict?: string;
}

export class TsCardioFeaturePipeline {
  private spec = featureSpec;

  public extractMcuFeatures(mcu: RawMcuRecord, prevMcu?: RawMcuRecord): Record<string, number> {
    const mcuSpec = this.spec.mcu_features as Record<string, any>;

    const getVal = (primary: any, secondary: any, defaultVal: number): number => {
      const v = primary !== undefined ? primary : secondary;
      return typeof v === 'number' && !isNaN(v) ? v : defaultVal;
    };

    const age = getVal(mcu.age, null, mcuSpec.age.default_impute_value);
    const bmi = getVal(mcu.bmi, null, mcuSpec.bmi.default_impute_value);
    const sbp = getVal(mcu.systolic_bp, mcu.systolicBp, mcuSpec.systolic_bp.default_impute_value);
    const dbp = getVal(mcu.diastolic_bp, mcu.diastolicBp, mcuSpec.diastolic_bp.default_impute_value);
    const hr = getVal(mcu.resting_heart_rate, mcu.restingHeartRate, mcuSpec.resting_heart_rate.default_impute_value);
    const glucose = getVal(mcu.fasting_glucose, mcu.fastingGlucoseMgdl, mcuSpec.fasting_glucose.default_impute_value);
    const totChol = getVal(mcu.total_cholesterol, mcu.totalCholesterolMgdl, mcuSpec.total_cholesterol.default_impute_value);
    const hdl = Math.max(1.0, getVal(mcu.hdl_cholesterol, mcu.hdlCholesterolMgdl, mcuSpec.hdl_cholesterol.default_impute_value));
    const ldl = getVal(mcu.ldl_cholesterol, mcu.ldlCholesterolMgdl, mcuSpec.ldl_cholesterol.default_impute_value);
    const tg = getVal(mcu.triglycerides, mcu.triglyceridesMgdl, mcuSpec.triglycerides.default_impute_value);

    // Encodings
    const genderStr = (mcu.gender || 'MALE').toUpperCase();
    const genderCode = mcuSpec.gender.encoding[genderStr] ?? 1;

    const smokeStr = (mcu.smoking_status || mcu.smokingStatus || 'NON_SMOKER').toUpperCase();
    const smokeCode = mcuSpec.smoking_status.encoding[smokeStr] ?? 0;

    const ecgStr = (mcu.resting_ecg || mcu.restingEcgInterpretation || 'NORMAL').toUpperCase();
    const ecgCode = mcuSpec.resting_ecg.encoding[ecgStr] ?? 0;

    // Derived Hemodynamics & Lipids
    const pulsePressure = sbp - dbp;
    const map = Number((dbp + (1.0 / 3.0) * (sbp - dbp)).toFixed(2));
    const cholHdlRatio = Number((totChol / hdl).toFixed(2));
    const tgHdlRatio = Number((tg / hdl).toFixed(2));

    // Asia-Pacific BMI Categories
    let bmiCat = 0;
    if (bmi < 18.5) bmiCat = 0;
    else if (bmi < 23.0) bmiCat = 1;
    else if (bmi < 25.0) bmiCat = 2;
    else if (bmi < 30.0) bmiCat = 3;
    else bmiCat = 4;

    // Metabolic Syndrome
    let metsCount = 0;
    if (bmi >= 25.0) metsCount++;
    if (tg >= 150.0) metsCount++;
    if ((genderCode === 1 && hdl < 40.0) || (genderCode === 0 && hdl < 50.0)) metsCount++;
    if (sbp >= 130 || dbp >= 85) metsCount++;
    if (glucose >= 100.0) metsCount++;
    const metsFlag = metsCount >= 3 ? 1 : 0;

    // Longitudinal Delta
    let deltaSbp = 0.0;
    let deltaBmi = 0.0;
    let deltaLdl = 0.0;
    if (prevMcu) {
      const prevSbp = getVal(prevMcu.systolic_bp, prevMcu.systolicBp, sbp);
      const prevBmi = getVal(prevMcu.bmi, null, bmi);
      const prevLdl = getVal(prevMcu.ldl_cholesterol, prevMcu.ldlCholesterolMgdl, ldl);
      deltaSbp = Number((sbp - prevSbp).toFixed(1));
      deltaBmi = Number((bmi - prevBmi).toFixed(2));
      deltaLdl = Number((ldl - prevLdl).toFixed(1));
    }

    return {
      age,
      bmi,
      systolic_bp: sbp,
      diastolic_bp: dbp,
      resting_heart_rate: hr,
      fasting_glucose: glucose,
      total_cholesterol: totChol,
      hdl_cholesterol: hdl,
      ldl_cholesterol: ldl,
      triglycerides: tg,
      gender_code: genderCode,
      smoking_code: smokeCode,
      resting_ecg_code: ecgCode,
      pulse_pressure: pulsePressure,
      mean_arterial_pressure: map,
      cholesterol_hdl_ratio: cholHdlRatio,
      triglycerides_hdl_ratio: tgHdlRatio,
      bmi_category_asia_pacific: bmiCat,
      metabolic_syndrome_flag: metsFlag,
      delta_sbp_vs_prev_year: deltaSbp,
      delta_bmi_vs_prev_year: deltaBmi,
      delta_ldl_vs_prev_year: deltaLdl
    };
  }

  public extractDcuWindowFeatures(dcuHistory: RawDcuRecord[]): Record<string, number> {
    if (!dcuHistory || dcuHistory.length === 0) {
      return {
        sbp_mean_7d: 120.0, sbp_std_7d: 0.0, sbp_slope_7d: 0.0,
        sbp_mean_30d: 120.0, sbp_std_30d: 0.0,
        prop_hypertensive_days_30d: 0.0, sleep_hours_mean_7d: 7.0,
        complaints_count_30d: 0, unfit_days_count_30d: 0
      };
    }

    const last7 = dcuHistory.slice(-7);
    const last30 = dcuHistory.slice(-30);

    const getSbp = (d: RawDcuRecord) => d.systolic_bp ?? d.systolicBp ?? 120;
    const getDbp = (d: RawDcuRecord) => d.diastolic_bp ?? d.diastolicBp ?? 80;
    const getSleep = (d: RawDcuRecord) => d.sleep_hours_last_24h ?? d.sleepHoursLast24h ?? 7.0;

    const sbp7 = last7.map(getSbp);
    const sbpMean7d = sbp7.reduce((a, b) => a + b, 0) / sbp7.length;
    
    let sbpStd7d = 0.0;
    if (sbp7.length > 1) {
      const var7 = sbp7.reduce((sum, v) => sum + Math.pow(v - sbpMean7d, 2), 0) / sbp7.length;
      sbpStd7d = Math.sqrt(var7);
    }

    // Slope 7d (Linear regression slope)
    let sbpSlope7d = 0.0;
    if (sbp7.length >= 3) {
      const n = sbp7.length;
      const xMean = (n - 1) / 2.0;
      let num = 0;
      let den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (sbp7[i] - sbpMean7d);
        den += Math.pow(i - xMean, 2);
      }
      sbpSlope7d = den !== 0 ? num / den : 0.0;
    }

    // 30d stats
    const sbp30 = last30.map(getSbp);
    const sbpMean30d = sbp30.reduce((a, b) => a + b, 0) / sbp30.length;
    let sbpStd30d = 0.0;
    if (sbp30.length > 1) {
      const var30 = sbp30.reduce((sum, v) => sum + Math.pow(v - sbpMean30d, 2), 0) / sbp30.length;
      sbpStd30d = Math.sqrt(var30);
    }

    // Proportion Hypertensive Days
    const htCount = last30.filter(d => getSbp(d) >= 140 || getDbp(d) >= 90).length;
    const propHt = htCount / last30.length;

    // Sleep 7d
    const sleep7 = last7.map(getSleep);
    const sleepMean7d = sleep7.reduce((a, b) => a + b, 0) / sleep7.length;

    // Complaints & Unfit
    const complaints = last30.filter(d => d.chest_pain_flag || d.chestPainFlag || d.shortness_of_breath_flag || d.shortnessOfBreathFlag || d.dizziness_flag || d.dizzinessFlag).length;
    const unfit = last30.filter(d => (d.daily_fitness_verdict || d.dailyFitnessVerdict) === 'UNFIT').length;

    return {
      sbp_mean_7d: Number(sbpMean7d.toFixed(2)),
      sbp_std_7d: Number(sbpStd7d.toFixed(2)),
      sbp_slope_7d: Number(sbpSlope7d.toFixed(3)),
      sbp_mean_30d: Number(sbpMean30d.toFixed(2)),
      sbp_std_30d: Number(sbpStd30d.toFixed(2)),
      prop_hypertensive_days_30d: Number(propHt.toFixed(3)),
      sleep_hours_mean_7d: Number(sleepMean7d.toFixed(2)),
      complaints_count_30d: complaints,
      unfit_days_count_30d: unfit
    };
  }

  public scaleFeatures(featureDict: Record<string, number>): Record<string, number> {
    const mcuSpec = this.spec.mcu_features as Record<string, any>;
    const scaled: Record<string, number> = {};
    for (const [k, v] of Object.entries(featureDict)) {
      if (mcuSpec[k] && mcuSpec[k].scaling) {
        const mean = mcuSpec[k].scaling.mean;
        const std = mcuSpec[k].scaling.std;
        scaled[k] = Number(((v - mean) / std).toFixed(5));
      } else {
        scaled[k] = v;
      }
    }
    return scaled;
  }
}
