import { UserRole } from '@cardiowork/shared';

export interface DemoUser {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  badge: string;
  avatarColor: string;
  description: string;
  allowedPaths: string[];
}

export const DEMO_PERSONAS: DemoUser[] = [
  {
    id: 'usr-doc-01',
    name: 'dr. Satria Wibowo, Sp.Ok',
    title: 'Dokter Okupasi & Spesialis Jantung Kerja',
    role: 'OCCUPATIONAL_DOCTOR',
    badge: 'Dokter Okupasi',
    avatarColor: 'bg-emerald-600 text-white',
    description: 'Akses penuh ke seluruh rekam medis tahunan, interpretasi EKG, skor prediksi multi-tier, dan penetapan surat kelayakan kerja (Fit/Unfit).',
    allowedPaths: ['/', '/workers', '/worker', '/kiosk', '/population', '/upload']
  },
  {
    id: 'usr-para-02',
    name: 'Nisa Rahmawati, S.Kep., Ns.',
    title: 'Paramedis Klinik Site & Respon Cepat',
    role: 'PARAMEDIC',
    badge: 'Paramedis Site',
    avatarColor: 'bg-sky-600 text-white',
    description: 'Bertanggung jawab atas pemeriksaan tanda vital pre-shift harian (DCU), pengunggahan data massal CSV, dan respons alarm darurat klinis.',
    allowedPaths: ['/', '/workers', '/worker', '/kiosk', '/upload']
  },
  {
    id: 'usr-k3-03',
    name: 'Hendra Gunawan, S.T., M.KKK',
    title: 'Manajer HSSE & Keselamatan Kerja',
    role: 'HSSE_OFFICER',
    badge: 'Petugas K3 / HSSE',
    avatarColor: 'bg-amber-600 text-white',
    description: 'Akses dashboard epidemiologi dan statistik agregat populasi. Data privasi medis individual pekerja disamarkan (Small-Cell Suppression).',
    allowedPaths: ['/', '/workers', '/population']
  },
  {
    id: 'usr-work-04',
    name: 'Eko Saputra (Toolpusher)',
    title: 'Pekerja Lapangan — Drilling Operations',
    role: 'WORKER',
    badge: 'Pekerja Lapangan',
    avatarColor: 'bg-rose-600 text-white',
    description: 'Akses ke Kios Skrining Mandiri pre-shift, edukasi kardiovaskular interaktif, serta ringkasan kebugaran pribadi.',
    allowedPaths: ['/', '/worker/W-00192', '/kiosk']
  }
];

export const COOKIE_NAME = 'cardiowork_session';

export function getDefaultPersona(): DemoUser {
  return DEMO_PERSONAS[0]; // Default: Dokter Okupasi
}
