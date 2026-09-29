'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  HeartPulse, 
  HardHat, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  Info,
  Check
} from 'lucide-react';
import { DEMO_PERSONAS, DemoUser, COOKIE_NAME, findUserByEmail, isPathAllowed } from '@/lib/session';
import { Card3DTilt } from '@/components/3d/Card3DTilt';

function LoginFormContent({ 
  returnUrl = '', 
  reason = '' 
}: { 
  returnUrl?: string; 
  reason?: string; 
}) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  const handleLoginWithUser = (user: DemoUser) => {
    setIsLoading(true);
    setError(null);
    setSelectedPersonaId(user.id);

    // Tulis session cookie (7 hari)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;

    // Tentukan path tujuan: jika returnUrl diperbolehkan oleh role ini, tuju returnUrl; jika tidak, tuju defaultPath
    let destination = user.defaultPath;
    if (returnUrl && returnUrl !== '/login' && returnUrl !== '/access-denied') {
      if (isPathAllowed(user.role, returnUrl)) {
        destination = returnUrl;
      }
    }

    setTimeout(() => {
      router.push(destination);
      router.refresh();
    }, 350);
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Silakan masukkan alamat email akun Anda.');
      return;
    }

    const matchedUser = findUserByEmail(email);
    if (!matchedUser) {
      setError(`Alamat email "${email}" tidak terdaftar. Gunakan salah satu email demo yang tersedia di bawah.`);
      return;
    }

    handleLoginWithUser(matchedUser);
  };

  const getPersonaIcon = (role: DemoUser['role']) => {
    switch (role) {
      case 'OCCUPATIONAL_DOCTOR':
        return <Stethoscope className="w-5 h-5 text-rose-700" />;
      case 'PARAMEDIC':
        return <HeartPulse className="w-5 h-5 text-emerald-700" />;
      case 'HSSE_OFFICER':
        return <ShieldCheck className="w-5 h-5 text-amber-700" />;
      case 'WORKER':
        return <HardHat className="w-5 h-5 text-stone-700" />;
      default:
        return <Activity className="w-5 h-5 text-rose-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-medical-grid flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white animate-heartbeat" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-stone-900">
                  Cardio<span className="text-rose-700">Work</span>
                </span>
                <span className="bg-rose-50 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                  CDSS AI
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Sistem Terpadu K3 & Prediksi Risiko Kardiovaskular
              </p>
            </div>
          </Link>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight pt-2">
            Portal Masuk & Verifikasi Peran (RBAC)
          </h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            Akses ke rekam medis dan data analitik dibatasi secara ketat berdasarkan wewenang klinis dan kepatuhan UU PDP No. 27/2022.
          </p>
        </div>

        {/* Reason Banner if redirected */}
        {reason === 'unauthorized' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Sesi Anda Diperlukan:</strong> Anda mencoba mengakses halaman yang dilindungi. Silakan masuk terlebih dahulu dengan akun yang memiliki hak akses.
            </div>
          </div>
        )}

        {/* Prominent Evaluator / Reviewer 1-Click Access Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-rose-50/50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-rose-700" />
                Mode Penguji / Audit Akademik K3
              </div>
              <div className="text-sm font-extrabold text-stone-900">
                1-Klik Masuk sebagai Dokter Okupasi (Akses Lengkap)
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Buka seketika seluruh fitur: Rekam Medis (W-00190/W-00189), Model Lab Benchmark, Analisis Populasi, &amp; CDSS AI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const doc = DEMO_PERSONAS.find(p => p.role === 'OCCUPATIONAL_DOCTOR');
              if (doc) handleLoginWithUser(doc);
            }}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
          >
            <span>Masuk Cepat Dokter (Akses Penuh)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: 1-Click Persona Quick Login (Interactive & Realistic) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  1-Klik Masuk Berdasarkan Peran (Demo Persona)
                </h3>
              </div>
              <span className="text-xs bg-rose-50 text-rose-800 font-semibold px-2.5 py-1 rounded-full border border-rose-200">
                Pilih Profil
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Klik salah satu persona di bawah ini untuk mensimulasikan alur kerja nyata dengan hak akses dan pembatasan data yang sesuai:
            </p>

            <div className="space-y-3">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <Card3DTilt key={persona.id} maxTilt={6} scale={1.02}>
                    <button
                      onClick={() => handleLoginWithUser(persona)}
                      disabled={isLoading}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                          : 'bg-stone-50/70 border-stone-200 hover:bg-white hover:border-rose-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform">
                        {getPersonaIcon(persona.role)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-stone-900 text-sm group-hover:text-rose-800 transition-colors">
                            {persona.name}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200 shrink-0">
                            {persona.badge}
                          </span>
                        </div>

                        <div className="text-xs text-stone-500 font-mono mt-0.5">
                          {persona.email}
                        </div>

                        <p className="text-xs text-stone-600 mt-2 leading-snug line-clamp-2">
                          {persona.description}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-stone-200/60">
                          <span className="text-stone-500">
                            Ruang Kerja Utama: <strong className="text-stone-800">{persona.defaultPath}</strong>
                          </span>
                          <span className="font-semibold text-rose-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                            Masuk sebagai {persona.badge} &rarr;
                          </span>
                        </div>
                      </div>
                    </button>
                  </Card3DTilt>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Form Kredensial Standar & Info Kepatuhan */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Standard Login Form Box */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <KeyRound className="w-4 h-4 text-stone-600" />
                <h3 className="font-bold text-stone-900 text-base">
                  Masuk dengan Kredensial
                </h3>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Alamat Email Kerja
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: dokter@cardiowork.id"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Mode demonstrasi: kata sandi bebas (contoh: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">cardiowork123</code>)
                  </span>
                </div>

                {/* Quick email auto-fill chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-stone-600 block">
                    Pilih Cepat Email:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setEmail(p.email);
                          setPassword('cardiowork123');
                          setError(null);
                        }}
                        className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition ${
                          email === p.email
                            ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                            : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {p.email.split('@')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Sesi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Compliance & Security Box */}
            <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-rose-700" />
                <span>Kepatuhan Regulasi & Privasi Data</span>
              </div>
              <p className="leading-relaxed">
                Setiap login dan akses rekam medis diproteksi sesuai amanat <strong className="text-stone-800">UU Perlindungan Data Pribadi (UU PDP No. 27/2022)</strong> dan <strong className="text-stone-800">Permenkes No. 24/2022</strong>. Akses individual pekerja hanya terbuka bagi tenaga medis terverifikasi.
              </p>
            </div>

          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline underline-offset-2"
          >
            &larr; Kembali ke Beranda CardioWork
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { returnUrl?: string; reason?: string };
}) {
  return (
    <LoginFormContent 
      returnUrl={searchParams?.returnUrl || ''} 
      reason={searchParams?.reason || ''} 
    />
  );
}
