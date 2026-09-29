'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  LogIn, 
  CheckCircle, 
  FileText, 
  ExternalLink,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { DEMO_PERSONAS, UserRole, getDefaultPathForRole } from '@/lib/session';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = (searchParams.get('role') || 'WORKER') as UserRole;
  const deniedPath = searchParams.get('deniedPath') || '/';

  const user = DEMO_PERSONAS.find(p => p.role === role) || DEMO_PERSONAS[0];
  const targetPath = getDefaultPathForRole(role);

  // Analisis alasan spesifik pembatasan berdasarkan role dan path
  const getRestrictionDetails = () => {
    if (role === 'HSSE_OFFICER' && (deniedPath.startsWith('/worker') || deniedPath.startsWith('/workers'))) {
      return {
        title: 'Perlindungan Kerahasiaan Data Medis Individual',
        regulation: 'UU PDP No. 27/2022 Pasal 4 & Permenkes No. 24/2022',
        explanation: 'Data rekam medis individu (hasil laboratorium darah, rekam EKG, dan riwayat klinis spesifik pekerja) diklasifikasikan sebagai Data Pribadi Spesifik yang dilindungi undang-undang. Sebagai Petugas K3 / HSSE, Anda diberikan hak akses penuh ke data agregat dan statistik epidemiologi tanpa membuka privasi medis pekerja secara individual.',
        recommendedPath: '/population',
        recommendedLabel: 'Buka Dashboard Populasi K3'
      };
    }

    if (role === 'WORKER') {
      return {
        title: 'Pembatasan Akses Rekam Medis Rekan Kerja & Analitik Internal',
        regulation: 'UU PDP No. 27/2022 & Kebijakan Tata Kelola Medis Perusahaan',
        explanation: 'Akun Pekerja Lapangan hanya berhak melihat rekam medis, status Laik Kerja (Fit-to-Work), dan tanda vital milik diri sendiri. Akses ke rekam medis rekan kerja lain, kiosk paramedis, atau analitik model AI dibatasi untuk mencegah kebocoran informasi medis privat.',
        recommendedPath: '/portal',
        recommendedLabel: 'Buka Portal Kesehatan Mandiri'
      };
    }

    if (role === 'PARAMEDIC' && deniedPath.startsWith('/model-lab')) {
      return {
        title: 'Kewenangan Validasi & Kalibrasi Model Lab',
        regulation: 'Tata Kelola Clinical Decision Support System (CDSS) K3',
        explanation: 'Menu Model Lab dan re-training inferensi AI multimodal dibatasi khusus untuk Dokter Spesialis Okupasi (Sp.Ok) dan Tim Peneliti Medis untuk menjamin validitas metodologi klinis.',
        recommendedPath: '/kiosk',
        recommendedLabel: 'Kembali ke DCU Kiosk'
      };
    }

    return {
      title: 'Hak Akses Rute Dibatasi',
      regulation: 'Kebijakan Keamanan Berbasis Peran (RBAC) CardioWork',
      explanation: `Peran aktif Anda (${user.badge}) tidak memiliki hak izin untuk membuka rute "${deniedPath}". Silakan kembali ke ruang kerja yang telah ditentukan atau masuk dengan akun yang berwenang.`,
      recommendedPath: targetPath,
      recommendedLabel: 'Buka Ruang Kerja Saya'
    };
  };

  const details = getRestrictionDetails();

  return (
    <div className="min-h-screen bg-medical-grid flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  HTTP 403 FORBIDDEN
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  Akses Ditolak
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {details.title}
              </h1>
            </div>
          </div>

          {/* Active User Context */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-stone-500 block text-xs">Akun Aktif Saat Ini:</span>
              <strong className="text-stone-900 font-bold text-sm">{user.name}</strong>
              <div className="text-stone-500 text-xs">{user.title}</div>
            </div>
            <div className="sm:text-right">
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white text-stone-800 border border-stone-300 shadow-2xs">
                Peran: {user.badge}
              </span>
              <div className="text-[11px] text-stone-500 font-mono mt-1">
                Mencoba akses: {deniedPath}
              </div>
            </div>
          </div>

          {/* Regulatory Context Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Shield className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Landasan Hukum & Kepatuhan Medis:</span>
            </div>
            <div className="font-semibold text-xs text-amber-800 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
              {details.regulation}
            </div>
            <p className="leading-relaxed text-xs sm:text-sm text-amber-900 pt-1">
              {details.explanation}
            </p>
          </div>

          {/* Allowed Workspace Navigation Links */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-700 block">
              Menu yang Diizinkan untuk Peran Anda:
            </span>
            <div className="flex flex-wrap gap-2">
              {user.allowedPaths.filter(p => p !== '/').map(p => (
                <Link
                  key={p}
                  href={p}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={details.recommendedPath}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-sm transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{details.recommendedLabel}</span>
            </Link>

            <Link
              href={`/login?returnUrl=${encodeURIComponent(deniedPath)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-300 font-bold text-sm shadow-2xs transition"
            >
              <LogIn className="w-4 h-4 text-stone-500" />
              <span>Ganti Akun / Login Peran Lain</span>
            </Link>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline underline-offset-2 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Beranda Utama</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-medical-grid flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-stone-600 text-sm">
          <Activity className="w-5 h-5 text-teal-700 animate-spin" />
          <span>Memverifikasi wewenang hak akses...</span>
        </div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
}
