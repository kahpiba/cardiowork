import type { UserRole } from '@cardiowork/shared';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workerPseudonymId?: string; // Khusus role WORKER untuk isolasi data dirinya sendiri
}

// Konfigurasi Matriks Hak Akses (RBAC Matrix)
export const ROLE_PERMISSIONS: Record<UserRole, {
  canViewIndividualClinicalData: boolean;
  canInputDcu: boolean;
  canReviewPredictions: boolean;
  canPrescribeInterventions: boolean;
  canViewAggregateDashboard: boolean;
  canAccessModelLab: boolean;
  canManageSystemConfig: boolean;
}> = {
  WORKER: {
    canViewIndividualClinicalData: true, // Hanya data dirinya sendiri
    canInputDcu: true,                  // Kios cek mandiri
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: false,
    canAccessModelLab: false,
    canManageSystemConfig: false,
  },
  PARAMEDIC: {
    canViewIndividualClinicalData: true,
    canInputDcu: true,
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: false,
    canAccessModelLab: false,
    canManageSystemConfig: false,
  },
  OCCUPATIONAL_DOCTOR: {
    canViewIndividualClinicalData: true,
    canInputDcu: true,
    canReviewPredictions: true,
    canPrescribeInterventions: true,
    canViewAggregateDashboard: true,
    canAccessModelLab: false,
    canManageSystemConfig: false,
  },
  HSSE_OFFICER: {
    canViewIndividualClinicalData: false, // DILARANG DATA INDIVIDUAL
    canInputDcu: false,
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: true,      // Hanya agregat K3
    canAccessModelLab: false,
    canManageSystemConfig: false,
  },
  HR_MANAGER: {
    canViewIndividualClinicalData: false, // DILARANG DATA INDIVIDUAL
    canInputDcu: false,
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: true,      // Hanya laporan kepatuhan agregat
    canAccessModelLab: false,
    canManageSystemConfig: false,
  },
  DATA_SCIENTIST: {
    canViewIndividualClinicalData: false, // Data ter-pseudonimisai
    canInputDcu: false,
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: true,
    canAccessModelLab: true,              // Akses Model Lab & registri model
    canManageSystemConfig: false,
  },
  SYSTEM_ADMIN: {
    canViewIndividualClinicalData: false, // Tanpa akses data klinis
    canInputDcu: false,
    canReviewPredictions: false,
    canPrescribeInterventions: false,
    canViewAggregateDashboard: false,
    canAccessModelLab: false,
    canManageSystemConfig: true,          // Kelola pengguna & audit log
  }
};

export function hasPermission(role: UserRole, permissionKey: keyof typeof ROLE_PERMISSIONS['WORKER']): boolean {
  return ROLE_PERMISSIONS[role]?.[permissionKey] ?? false;
}
