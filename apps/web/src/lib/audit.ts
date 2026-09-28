import { db } from '../db/index';
import { auditLogs } from '../db/schema';
import { repository } from '../db/repository';
import type { UserRole } from '@cardiowork/shared';

export interface AuditLogEntry {
  userId: string;
  userRole: UserRole;
  action: 'READ' | 'WRITE' | 'EXPORT' | 'INFERENCE' | 'LOGIN' | 'CONSENT_UPDATE';
  resourceAccessed: string;
  clientIp?: string;
  userAgent?: string;
}

export interface GenericAuditEvent {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  userId?: string;
  userRole?: UserRole;
}

/**
 * Mencatat log audit akses atau modifikasi data medis secara aman dan append-only.
 * Sesuai kepatuhan Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Di lingkungan serverless tanpa DB aktif, log juga dicatat ke stdout untuk telemetri Vercel
    console.info(`[AUDIT_LOG] ${entry.userRole}:${entry.userId} - ${entry.action} on ${entry.resourceAccessed}`);
    
    await repository.saveAuditLog({
      userId: entry.userId,
      userRole: entry.userRole,
      action: entry.action,
      resourceAccessed: entry.resourceAccessed,
      clientIp: entry.clientIp || '127.0.0.1',
      userAgent: entry.userAgent || 'unknown',
    });
  } catch (error) {
    // Audit failure tidak boleh membocorkan rahasia, namun dicatat sebagai peringatan sistem
    console.error('[AUDIT_ERROR] Gagal menyimpan log audit klinis:', error);
  }
}

/**
 * Helper fleksibel untuk pencatatan event audit di berbagai route handler API.
 */
export async function logAuditEvent(event: GenericAuditEvent): Promise<void> {
  let mappedAction: AuditLogEntry['action'] = 'INFERENCE';
  if (event.action === 'CREATE' || event.action === 'WRITE') mappedAction = 'WRITE';
  else if (event.action === 'READ') mappedAction = 'READ';
  else if (event.action === 'EXPORT') mappedAction = 'EXPORT';

  return recordAuditLog({
    userId: event.userId || event.resourceId || 'system',
    userRole: event.userRole || 'WORKER',
    action: mappedAction,
    resourceAccessed: `${event.resourceType || 'API'}:${event.resourceId || 'event'}`
  });
}
