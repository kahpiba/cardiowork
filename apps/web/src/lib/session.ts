import { UserRole } from '@cardiowork/shared';
export type { UserRole };

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  title: string;
  role: UserRole;
  badge: string;
  avatarColor: string;
  description: string;
  department: string;
  defaultPath: string;
  allowedPaths: string[];
}

export const DEMO_PERSONAS: DemoUser[] = [
  {
    id: 'usr-doc-01',
    email: 'dokter@cardiowork.id',
    name: 'dr. Satria Wibowo, Sp.Ok',
    title: 'Dokter Okupasi & Spesialis Jantung Kerja',
    role: 'OCCUPATIONAL_DOCTOR',
    badge: 'Dokter Okupasi',
    avatarColor: 'bg-rose-700 text-white',
    department: 'Occupational Health & Medical Services',
    description: 'Akses penuh ke seluruh rekam medis tahunan, interpretasi EKG, skor prediksi multi-tier, validasi Model Lab, dan penetapan surat kelayakan kerja (Fit/Unfit).',
    defaultPath: '/workers',
    allowedPaths: ['/', '/workers', '/worker', '/kiosk', '/population', '/upload', '/model-lab', '/reports', '/portal']
  },
  {
    id: 'usr-para-02',
    email: 'paramedis@cardiowork.id',
    name: 'Nisa Rahmawati, S.Kep., Ns.',
    title: 'Paramedis Klinik Site & Respon Cepat',
    role: 'PARAMEDIC',
    badge: 'Paramedis Site',
    avatarColor: 'bg-emerald-700 text-white',
    department: 'Site Emergency & Daily Check-Up Clinic',
    description: 'Bertanggung jawab atas pemeriksaan tanda vital pre-shift harian (DCU), verifikasi kehadiran pekerja, pengunggahan data massal CSV, dan penanganan alarm darurat.',
    defaultPath: '/kiosk',
    allowedPaths: ['/', '/workers', '/worker', '/kiosk', '/upload', '/reports', '/portal']
  },
  {
    id: 'usr-k3-03',
    email: 'hsse@cardiowork.id',
    name: 'Hendra Gunawan, S.T., M.KKK',
    title: 'Manajer HSSE & Keselamatan Kerja',
    role: 'HSSE_OFFICER',
    badge: 'Petugas K3 / HSSE',
    avatarColor: 'bg-amber-700 text-white',
    department: 'Health, Safety, Security & Environment (HSSE)',
    description: 'Akses dashboard epidemiologi dan statistik agregat populasi. Data privasi medis individual pekerja disamarkan sesuai UU PDP No. 27/2022 Pasal 4.',
    defaultPath: '/population',
    allowedPaths: ['/', '/population']
  },
  {
    id: 'usr-work-04',
    email: 'pekerja@cardiowork.id',
    name: 'Eko Saputra',
    title: 'Pekerja Lapangan — Toolpusher',
    role: 'WORKER',
    badge: 'Pekerja Lapangan',
    avatarColor: 'bg-stone-700 text-white',
    department: 'Drilling Operations (Offshore Rig Alpha)',
    description: 'Akses ke Portal Kesehatan Mandiri, status Laik Kerja pre-shift pribadi, riwayat tensi 30 hari, edukasi gaya hidup & diet DASH.',
    defaultPath: '/portal',
    allowedPaths: ['/', '/portal', '/kiosk']
  }
];

export const COOKIE_NAME = 'cardiowork_session';

export function getDefaultPersona(): DemoUser {
  return DEMO_PERSONAS[0]; // Default: Dokter Okupasi
}

export function findUserById(id: string): DemoUser | undefined {
  return DEMO_PERSONAS.find(p => p.id === id);
}

export function findUserByEmail(email: string): DemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_PERSONAS.find(p => p.email.toLowerCase() === normalized);
}

export function getDefaultPathForRole(role: UserRole): string {
  const user = DEMO_PERSONAS.find(p => p.role === role);
  return user?.defaultPath || '/';
}

/**
 * Memeriksa apakah suatu rute diizinkan untuk peran pengguna tertentu.
 */
export function isPathAllowed(role: UserRole, pathname: string): boolean {
  // Halaman publik yang dapat diakses siapapun
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/access-denied') ||
    pathname.startsWith('/kiosk') ||
    pathname.startsWith('/methodology') ||
    pathname.startsWith('/api/')
  ) {
    return true;
  }

  const user = DEMO_PERSONAS.find(p => p.role === role);
  if (!user) return false;

  return user.allowedPaths.some(allowed => {
    if (allowed === '/') return pathname === '/';
    return pathname === allowed || pathname.startsWith(`${allowed}/`);
  });
}
