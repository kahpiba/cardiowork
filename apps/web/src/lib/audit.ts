import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
import type { UserRole } from '@cardiowork/shared';

export interface AuditLogEntry {
  userId: string;
  userRole: UserRole;
  action: 'READ' | 'WRITE' | 'EXPORT' | 'INFERENCE' | 'LOGIN' | 'CONSENT_UPDATE';
  resourceAccessed: string;
  clientIp?: string;
  userAgent?: string;
}

/**
 * Mencatat log audit akses atau modifikasi data medis secara aman dan append-only.
 * Sesuai kepatuhan Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Di lingkungan serverless tanpa DB aktif, log juga dicatat ke stdout untuk telemetri Vercel
    console.info(`[AUDIT_LOG] ${entry.userRole}:${entry.userId} - ${entry.action} on ${entry.resourceAccessed}`);
    
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')) {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        userRole: entry.userRole,
        action: entry.action,
        resourceAccessed: entry.resourceAccessed,
        clientIp: entry.clientIp || '127.0.0.1',
        userAgent: entry.userAgent || 'unknown',
      });
    }
  } catch (error) {
    // Audit failure tidak boleh membocorkan rahasia, namun dicatat sebagai peringatan sistem
    console.error('[AUDIT_ERROR] Gagal menyimpan log audit klinis:', error);
  }
}
