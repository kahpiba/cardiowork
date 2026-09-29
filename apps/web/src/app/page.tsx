import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  Cpu, 
  HeartPulse, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  LogIn,
  HardHat,
  Terminal,
  UploadCloud,
  Heart
} from 'lucide-react';
import { EducationalHealthGuide } from '@/components/EducationalHealthGuide';
import { DEMO_PERSONAS, COOKIE_NAME, DemoUser, isPathAllowed } from '@/lib/session';
import { Card3DTilt } from '@/components/3d/Card3DTilt';
import { Interactive3DHeart } from '@/components/3d/Interactive3DHeart';
import { LiveEcgWaveform } from '@/components/animations/LiveEcgWaveform';

export default function HomePage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  let activeUser: DemoUser | null = null;

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
      const matched = DEMO_PERSONAS.find(p => p.id === parsed.id || p.role === parsed.role);
      if (matched) activeUser = matched;
    } catch {
      activeUser = null;
    }
  }

  return (
    <div className="bg-medical-grid min-h-[calc(100vh-4rem)] pb-20">
      
      {/* Hero Header with 3D Interactive Cardiac Model & Warm Medical Aesthetic */}
      <section className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 bg-gradient-to-b from-stone-50/70 via-white to-stone-50/50">
        
        <div className="relative max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headlines, Sesi Status, Action CTAs, and Live ECG Waveform */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Active Session or Guest Status Alert */}
              {activeUser ? (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                      <span className="text-xs font-bold text-rose-950">Sesi Terverifikasi: {activeUser.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-rose-800 border border-rose-200">
                        {activeUser.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5 truncate max-w-md">
                      {activeUser.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={activeUser.defaultPath}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition"
                    >
                      <span>Buka Ruang Kerja</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-100/90 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-700" />
                      <span className="text-xs font-bold text-stone-900">Hak Akses Berjenjang (RBAC Terproteksi)</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Akses rekam medis disesuaikan dengan peran kerja & UU PDP No. 27/2022.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Masuk / Pilih Akun</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold shadow-2xs">
                <Activity className="h-3.5 w-3.5 text-rose-700 animate-heartbeat" />
                <span>Purwarupa Riset K3 &amp; AI Kardiovaskular Pekerja (MCU + DCU)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                Sistem Skrining &amp; Stratifikasi <br />
                <span className="text-rose-800">
                  Risiko Kardiovaskular di Tempat Kerja
                </span>
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
                Purwarupa sistem pendukung keputusan klinis (<strong className="text-stone-900 font-semibold">Clinical Decision Support System / CDSS</strong>) yang mengintegrasikan data longitudinal tahunan (<strong className="text-stone-900 font-semibold">MCU</strong>) dengan pemantauan tanda vital pre-shift harian (<strong className="text-stone-900 font-semibold">DCU</strong>) melalui pendekatan multi-tier (<strong className="text-stone-900 font-semibold">Layer 1–4</strong>) guna mendukung deteksi dini risiko kardiometabolik pekerja industri.
              </p>

              {/* Action Buttons Tailored by Auth State */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                {activeUser ? (
                  <>
                    <Link
                      href={activeUser.defaultPath}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-sm hover:shadow transition"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Masuk ke {activeUser.defaultPath === '/workers' ? 'Direktori Pekerja' : activeUser.defaultPath === '/kiosk' ? 'DCU Kiosk' : activeUser.defaultPath === '/population' ? 'Populasi K3' : 'Portal Mandiri'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {isPathAllowed(activeUser.role, '/kiosk') && activeUser.defaultPath !== '/kiosk' && (
                      <Link
                        href="/kiosk"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-900 border border-stone-300 font-bold text-sm shadow-2xs transition"
                      >
                        <HeartPulse className="w-4 h-4 text-rose-700" />
                        <span>Kios Cek Mandiri (DCU)</span>
                      </Link>
                    )}

                    {isPathAllowed(activeUser.role, '/population') && activeUser.defaultPath !== '/population' && (
                      <Link
                        href="/population"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-900 border border-stone-300 font-bold text-sm shadow-2xs transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-stone-700" />
                        <span>Populasi K3</span>
                      </Link>
                    )}

                    {isPathAllowed(activeUser.role, '/portal') && activeUser.defaultPath !== '/portal' && (
                      <Link
                        href="/portal"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-900 border border-stone-300 font-bold text-sm shadow-2xs transition"
                      >
                        <HardHat className="w-4 h-4 text-stone-700" />
                        <span>Portal Pekerja</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-sm hover:shadow transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk / Pilih Peran Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/kiosk"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-900 border border-stone-300 font-bold text-sm shadow-2xs transition"
                    >
                      <HeartPulse className="w-4 h-4 text-rose-700" />
                      <span>Kios DCU Pre-Shift (Publik)</span>
                    </Link>

                    <Link
                      href="/methodology"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm shadow-2xs transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-stone-600" />
                      <span>Metodologi &amp; Batasan</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Real-time Continuous ECG Waveform Display */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    Simulasi Monitor Irama EKG Pre-Shift (Lead II Ilustratif - Bukan Sensor Riil)
                  </span>
                  <span className="font-mono text-emerald-800 font-bold">75 BPM &bull; Irama Sinus Normal</span>
                </div>
                <LiveEcgWaveform bpm={75} height={70} color="#be123c" />
              </div>

            </div>

            {/* Right Column: 3D Interactive WebGL Heart Card with 3D Spatial Tilt */}
            <div className="lg:col-span-5">
              <Card3DTilt maxTilt={10} scale={1.02} className="rounded-3xl">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-xl p-5 space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">
                          Model Anatomi Jantung 3D
                        </h3>
                        <p className="text-[11px] text-stone-500">Simulasi 3D Anatomi Kardiak (WebGL)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      Interaktif 360&deg;
                    </span>
                  </div>

                  {/* 3D Heart Canvas Component */}
                  <Interactive3DHeart initialBpm={75} interactive={true} />

                </div>
              </Card3DTilt>
            </div>

          </div>

          {/* 4-Step Interactive Occupational Health Journey (with 3D Parallax Tilt) */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-2xs hover:shadow-md transition-shadow h-full">
                <span className="text-xs font-mono font-bold text-stone-500 block">TAHAP 1</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">MCU Tahunan</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">Biokimia lipid, glukosa & antropometri dasar</p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-2xs hover:shadow-md transition-shadow h-full">
                <span className="text-xs font-mono font-bold text-rose-800 block">TAHAP 2</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">DCU Pre-Shift</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">Skrining mandiri tensi, nadi, SpO2 & gejala harian</p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-2xs hover:shadow-md transition-shadow h-full">
                <span className="text-xs font-mono font-bold text-stone-500 block">TAHAP 3</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">Inferensi AI 4-Tier</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">Fusi multimodal MultimodalCardioFusionNet (Bi-GRU-D) &amp; Autoencoder</p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-2xs hover:shadow-md transition-shadow h-full">
                <span className="text-xs font-mono font-bold text-amber-800 block">TAHAP 4</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">Tindakan K3</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">Rekomendasi fit/unfit & protokol evakuasi cepat</p>
              </div>
            </Card3DTilt>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* 4 Multi-Tier Engine Badges with 3D Tilt Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-700" />
              <span>Arsitektur Inferensi AI 4-Tier Terpadu</span>
            </h2>
            <span className="text-xs sm:text-sm text-stone-500 font-medium">Baku Klinis &rarr; ML GBDT &rarr; Deep Learning Multimodal &rarr; Live EWS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-2.5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200">LAYER 1</span>
                  <span className="text-xs text-stone-500 font-medium">Transparan</span>
                </div>
                <div className="font-bold text-stone-900 text-base">Skor Klinis Baku</div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Framingham 10-Tahun, Bagan WHO/ISH SEARO D regional, dan formula ASCVD Pooled Cohort terstandarisasi.
                </p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-2.5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">LAYER 2</span>
                  <span className="text-xs text-stone-500 font-medium">Terkalibrasi</span>
                </div>
                <div className="font-bold text-stone-900 text-base">Machine Learning Klasik</div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Ensemble LightGBM / GBDT dengan kalibrasi probabilitas Isotonic Regression dan penjelasan nilai TreeSHAP.
                </p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-2.5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200">LAYER 3</span>
                  <span className="text-xs text-stone-500 font-medium">Multimodal</span>
                </div>
                <div className="font-bold text-stone-900 text-base">Deep Learning PyTorch</div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Multimodal Late-Fusion (Tabular MCU MLP + Deret Waktu DCU Bi-GRU-D) serta Autoencoder deteksi anomali.
                </p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={8} scale={1.03}>
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-2.5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">LAYER 4</span>
                  <span className="text-xs text-stone-500 font-medium">Real-Time</span>
                </div>
              <div className="font-bold text-stone-900 text-base">Daily Alerting & Kios</div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Peringatan lonjakan tensi akut pra-shift kerja, penentuan status kelayakan (Fit-for-Duty), dan protokol Medevac.
              </p>
            </div>
          </Card3DTilt>

        </div>
        </div>

        {/* Role-Based Portals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-800" />
              <span>Pilih Portal Pengguna (Role-Based Access Control)</span>
            </h2>
            <span className="text-xs text-stone-500 font-medium">Hak akses terpisah sesuai regulasi privasi UU PDP No. 27/2022</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Worker Portal */}
            <div className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg">Pekerja Lapangan (Kios Mandiri DCU)</h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Pengukuran mandiri tanda vital tensimeter dan oximeter sebelum shift kerja dimulai. Pantau status kelayakan kerja (Fit/Restriksi) harian secara mandiri.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Data Pribadi Mandiri
                </span>
                <Link
                  href="/kiosk"
                  className="text-xs sm:text-sm font-bold text-rose-800 hover:text-rose-900 flex items-center gap-1 group"
                >
                  <span>Buka Kios DCU</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Doctor Portal */}
            <div className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg">Dokter Perusahaan & Paramedik K3</h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Akses rekam medis komprehensif, telaah atribusi faktor risiko dengan TreeSHAP, konfirmasi peringatan kritis, dan terbitkan rekomendasi restriksi kerja.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Akses Penuh Rekam Medis
                </span>
                <Link
                  href="/worker/W-00190"
                  className="text-xs sm:text-sm font-bold text-rose-800 hover:text-rose-900 flex items-center gap-1 group"
                >
                  <span>Pasien Kritis (Hendra)</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* HSSE Portal */}
            <div className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg">Manajemen HR & Tim HSSE (K3)</h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Dashboard analitik agregat populasi tenaga kerja, tren risiko kardiovaskular per departemen, dan tingkat kepatuhan skrining tanpa membuka rekam medis individual.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Agregat Terproteksi (k &ge; 5)
                </span>
                <Link
                  href="/population"
                  className="text-xs sm:text-sm font-bold text-stone-800 hover:text-stone-900 flex items-center gap-1 group"
                >
                  <span>Dashboard Populasi</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Educational Insight: Kenapa Menggabungkan MCU + DCU? */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3.5 border-b border-stone-200/60 pb-5">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Pentingnya Integrasi MCU Tahunan & DCU Harian dalam K3 Modern
              </h3>
              <p className="text-sm text-stone-500">Mengapa Medical Check-Up (MCU) tahunan saja tidak cukup untuk mencegah serangan jantung mendadak?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-sm sm:text-base text-stone-900">Keterbatasan MCU Tahunan Konvensional</h4>
              </div>
              <ul className="text-xs sm:text-sm text-stone-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">&#10005;</span>
                  <span><strong>Titik Data Tunggal:</strong> Dilakukan hanya 1 kali setahun; fluktuasi tekanan darah atau kelelahan akut sehari-hari tidak terekam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">&#10005;</span>
                  <span><strong>Efek Jas Putih (White-Coat Effect):</strong> Tensi saat MCU di klinik sering tidak mencerminkan beban kerja fisik nyata di lapangan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">&#10005;</span>
                  <span><strong>Keterlambatan Intervensi:</strong> Perburukan kondisi jantung antara interval 12 bulan tidak terdeteksi hingga terjadi insiden fatal.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-800" />
                <h4 className="font-bold text-sm sm:text-base text-stone-900">Keunggulan Solusi Terpadu CardioWork</h4>
              </div>
              <ul className="text-xs sm:text-sm text-stone-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">&#10003;</span>
                  <span><strong>Pemantauan Pre-Shift 5 Menit (DCU):</strong> Mendeteksi lonjakan tensi (&ge;160 mmHg) sebelum pekerja naik rig, crane, atau mesin berat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">&#10003;</span>
                  <span><strong>Multimodal Deep Learning:</strong> AI menggabungkan profil darah MCU (kolesterol, gula darah) dengan variabilitas tensi DCU 30 hari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">&#10003;</span>
                  <span><strong>Zero-Downtime Decision Support:</strong> Dokter K3 langsung menerima peringatan otomatis untuk intervensi sebelum terjadi kegawatdaruratan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Patient Archetypes Demo Callout */}
        <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200">
                Demonstrasi Klinis Interaktif
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-2">
                Eksplorasi Profil Pasien & Simulator Risiko What-If
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Pilih profil pekerja di bawah ini untuk melihat evaluasi 4 layer model, riwayat MCU 3 tahun, grafik DCU 30 hari, dan simulator modifikasi gaya hidup:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            
            {/* Eko */}
            <Link
              href="/worker/W-00192"
              className="bg-white hover:bg-stone-50/80 p-5 rounded-xl border border-stone-200/90 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-stone-800">W-00192</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    FIT FOR DUTY
                  </span>
                </div>
                <div className="font-bold text-base text-stone-900 mt-2 flex items-center justify-between">
                  <span>Eko Saputra (49 th)</span>
                  <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">Sintetis</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-500 mt-0.5">Departemen Logistik • SBP Rata-rata: 118 mmHg</div>
                <div className="mt-2 text-xs text-emerald-800 font-medium">Risiko Framingham: 6.2% (Rendah &bull; Normotensif, Non-Perokok)</div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-stone-100 text-xs sm:text-sm font-bold text-rose-700 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

            {/* Joko */}
            <Link
              href="/worker/W-00189"
              className="bg-white hover:bg-stone-50/80 p-5 rounded-xl border border-stone-200/90 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-stone-800">W-00189</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    RESTRIKSI RINGAN
                  </span>
                </div>
                <div className="font-bold text-base text-stone-900 mt-2 flex items-center justify-between">
                  <span>Joko Wijaya (34 th)</span>
                  <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">Sintetis</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-500 mt-0.5">Departemen Fabrikasi • SBP Rata-rata: 136 mmHg</div>
                <div className="mt-2 text-xs text-amber-800 font-medium">Risiko Framingham: 9.8% (Sedang &bull; Perokok Aktif, Diabetes HbA1c 7.9%)</div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-stone-100 text-xs sm:text-sm font-bold text-stone-800 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

            {/* Hendra */}
            <Link
              href="/worker/W-00190"
              className="bg-white hover:bg-stone-50/80 p-5 rounded-xl border border-stone-200/90 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-stone-800">W-00190</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    UNFIT / KRITIS
                  </span>
                </div>
                <div className="font-bold text-base text-stone-900 mt-2 flex items-center justify-between">
                  <span>Hendra Pangestu (53 th)</span>
                  <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">Sintetis</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-500 mt-0.5">Departemen Pengeboran • SBP Rata-rata: 164 mmHg</div>
                <div className="mt-2 text-xs text-rose-700 font-medium">Risiko Framingham: 28.5% (Tinggi &bull; HT Derajat 2, Usia 53 th, Kol. 248)</div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-stone-100 text-xs sm:text-sm font-bold text-rose-700 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Pusat Edukasi Kesehatan Kardiovaskular Interaktif */}
        <EducationalHealthGuide />

        {/* System Architecture & Status Box */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <Cpu className="h-4 w-4 text-stone-500" />
              <span>Spesifikasi Riset &amp; Status Arsitektur (Tahap 1–8: Research Prototype &amp; PoC)</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Sistem Aktif & Terkalibrasi
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm font-mono">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">Web Framework:</span>
              <span className="text-stone-900 font-bold">Next.js 14 App Router</span>
            </div>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">Edge Inference:</span>
              <span className="text-rose-700 font-bold">ONNX Runtime (WASM)</span>
            </div>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">Cloud Database:</span>
              <span className="text-stone-800 font-bold">Neon Postgres</span>
            </div>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-xs">Vercel Region:</span>
              <span className="text-stone-800 font-bold">sin1 (Singapura)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
