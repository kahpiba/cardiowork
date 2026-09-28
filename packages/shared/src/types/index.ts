export type UserRole = 
  | 'WORKER'
  | 'PARAMEDIC'
  | 'OCCUPATIONAL_DOCTOR'
  | 'HSSE_OFFICER'
  | 'HR_MANAGER'
  | 'SYSTEM_ADMIN'
  | 'DATA_SCIENTIST';

export type ShiftPattern = '12H_DAY_NIGHT_ROTATION' | 'DAY_SHIFT_ONLY' | 'NIGHT_SHIFT_ONLY' | 'FLEXIBLE';

export type JobHazardCategory = 'HIGH' | 'MEDIUM' | 'LOW';

export type FitnessStatus = 'FIT' | 'FIT_WITH_RESTRICTION' | 'UNFIT';

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertTriggerSource = 'RULE_BASED' | 'DL_ANOMALY';

export type FollowupStatus = 'PENDING' | 'IN_PROGRESS' | 'REFERRED' | 'COMPLETED';

export type InferenceMode = 'onnx-node' | 'remote' | 'browser';
