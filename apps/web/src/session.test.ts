import { describe, it, expect } from 'vitest';
import { 
  DEMO_PERSONAS, 
  findUserById, 
  findUserByEmail, 
  getDefaultPathForRole, 
  isPathAllowed 
} from './lib/session';

describe('CardioWork Session & Role-Based Access Control (RBAC) System', () => {
  it('harus memuat 4 persona utama dengan lengkap', () => {
    expect(DEMO_PERSONAS).toHaveLength(4);
    const roles = DEMO_PERSONAS.map(p => p.role);
    expect(roles).toContain('OCCUPATIONAL_DOCTOR');
    expect(roles).toContain('PARAMEDIC');
    expect(roles).toContain('HSSE_OFFICER');
    expect(roles).toContain('WORKER');
  });

  it('dapat menemukan user berdasarkan email tanpa sensitivitas huruf kapital', () => {
    const doc = findUserByEmail('DOKTER@cardiowork.id');
    expect(doc).toBeDefined();
    expect(doc?.role).toBe('OCCUPATIONAL_DOCTOR');
    expect(doc?.name).toBe('dr. Satria Wibowo, Sp.Ok');

    const worker = findUserByEmail('pekerja@cardiowork.id ');
    expect(worker).toBeDefined();
    expect(worker?.role).toBe('WORKER');
  });

  it('mengembalikan default path yang tepat untuk tiap peran', () => {
    expect(getDefaultPathForRole('OCCUPATIONAL_DOCTOR')).toBe('/workers');
    expect(getDefaultPathForRole('PARAMEDIC')).toBe('/kiosk');
    expect(getDefaultPathForRole('HSSE_OFFICER')).toBe('/population');
    expect(getDefaultPathForRole('WORKER')).toBe('/portal');
  });

  it('mengizinkan rute publik untuk semua peran', () => {
    const publicPaths = ['/', '/login', '/login?returnUrl=/portal', '/access-denied', '/api/health', '/api/alerts/daily'];
    for (const path of publicPaths) {
      expect(isPathAllowed('WORKER', path)).toBe(true);
      expect(isPathAllowed('HSSE_OFFICER', path)).toBe(true);
      expect(isPathAllowed('PARAMEDIC', path)).toBe(true);
      expect(isPathAllowed('OCCUPATIONAL_DOCTOR', path)).toBe(true);
    }
  });

  it('menegakkan pembatasan rute klinis individual bagi Petugas K3 (UU PDP)', () => {
    // Petugas HSSE hanya diizinkan membuka data agregat populasi
    expect(isPathAllowed('HSSE_OFFICER', '/population')).toBe(true);
    expect(isPathAllowed('HSSE_OFFICER', '/workers')).toBe(false);
    expect(isPathAllowed('HSSE_OFFICER', '/worker/W-00192')).toBe(false);
    expect(isPathAllowed('HSSE_OFFICER', '/upload')).toBe(false);
    expect(isPathAllowed('HSSE_OFFICER', '/model-lab')).toBe(false);
  });

  it('membatasi pekerja lapangan hanya pada portal mandiri & kiosk pre-shift', () => {
    expect(isPathAllowed('WORKER', '/portal')).toBe(true);
    expect(isPathAllowed('WORKER', '/kiosk')).toBe(true);
    // Terlarang bagi pekerja:
    expect(isPathAllowed('WORKER', '/workers')).toBe(false);
    expect(isPathAllowed('WORKER', '/population')).toBe(false);
    expect(isPathAllowed('WORKER', '/model-lab')).toBe(false);
    expect(isPathAllowed('WORKER', '/upload')).toBe(false);
  });

  it('memberikan akses penuh kepada Dokter Okupasi (Sp.Ok)', () => {
    const doctorPaths = ['/workers', '/worker/W-00192', '/kiosk', '/population', '/upload', '/model-lab', '/portal'];
    for (const path of doctorPaths) {
      expect(isPathAllowed('OCCUPATIONAL_DOCTOR', path)).toBe(true);
    }
  });

  it('membatasi Paramedis dari Model Lab dan Populasi K3', () => {
    expect(isPathAllowed('PARAMEDIC', '/kiosk')).toBe(true);
    expect(isPathAllowed('PARAMEDIC', '/workers')).toBe(true);
    expect(isPathAllowed('PARAMEDIC', '/upload')).toBe(true);
    expect(isPathAllowed('PARAMEDIC', '/model-lab')).toBe(false);
    expect(isPathAllowed('PARAMEDIC', '/population')).toBe(false);
  });
});
