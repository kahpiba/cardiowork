import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  Cpu, 
  FileSpreadsheet, 
  HeartPulse, 
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { EducationalHealthGuide } from '@/components/EducationalHealthGuide';

export default function HomePage() {
  return (
    <div className="bg-medical-grid min-h-[calc(100vh-4rem)] pb-16">
      
      {/* Hero Header with Medical Gradient Glow */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-sky-50/30 to-white">
        
        {/* Subtle decorative background ECG line SVG */}
        <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
          <svg className="w-full h-32 text-sky-200/50" viewBox="0 0 1200 120" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M0 60 L300 60 L320 60 L335 15 L350 105 L365 30 L380 75 L395 60 L500 60 L650 60 L670 60 L685 15 L700 105 L715 30 L730 75 L745 60 L850 60 L1000 60 L1020 60 L1035 15 L1050 105 L1065 30 L1080 75 L1095 60 L1200 60" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
            <Activity className="h-4 w-4 text-rose-600 animate-heartbeat" />
            <span>Sistem Terpadu K3 & AI Kardiovaskular Pekerja (MCU + DCU)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Prediksi Risiko Kardiovaskular <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Presisi & Real-Time di Tempat Kerja
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            Menggabungkan rekam medis tahunan (<strong className="text-slate-800 font-semibold">Medical Check-Up / MCU</strong>) dengan pemantauan tanda vital harian sebelum shift (<strong className="text-slate-800 font-semibold">Daily Check-Up / DCU</strong>) melalui arsitektur AI bertingkat (<strong className="text-slate-800 font-semibold">Layer 1–4</strong>) untuk mencegah henti jantung mendadak di sektor industri.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/workers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm hover:shadow transition"
            >
              <Users className="w-4 h-4" />
              <span>Buka Direktori Pekerja</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 font-bold text-sm shadow-2xs transition"
            >
              <HeartPulse className="w-4 h-4 text-sky-600" />
              <span>Kios Cek Mandiri (DCU)</span>
            </Link>

            <Link
              href="/population"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 font-bold text-sm shadow-2xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Populasi K3 Perusahaan</span>
            </Link>
          </div>

          {/* 4-Step Interactive Occupational Health Journey */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-left max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-sky-600 block">TAHAP 1</span>
              <div className="text-xs font-bold text-slate-800">MCU Tahunan</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Biokimia lipid, glukosa & antropometri dasar</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-teal-600 block">TAHAP 2</span>
              <div className="text-xs font-bold text-slate-800">DCU Pre-Shift</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Skrining mandiri tensi, nadi, SpO2 & gejala harian</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-indigo-600 block">TAHAP 3</span>
              <div className="text-xs font-bold text-slate-800">Inferensi AI 4-Tier</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Fusi multimodal BiLSTM + Attention terkalibrasi</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-rose-600 block">TAHAP 4</span>
              <div className="text-xs font-bold text-slate-800">Tindakan K3</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Rekomendasi fit/unfit & protokol evakuasi cepat</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* 4 Multi-Tier Engine Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Arsitektur Inferensi AI 4-Tier Terpadu</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Baku Klinis &rarr; ML GBDT &rarr; Deep Learning Multimodal &rarr; Live EWS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 border-t-4 border-t-sky-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">LAYER 1</span>
                <span className="text-[11px] text-slate-400 font-medium">Transparan</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Skor Klinis Baku</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Framingham 10-Tahun, Bagan WHO/ISH SEARO D regional, dan formula ASCVD Pooled Cohort terstandarisasi.
              </p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-teal-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">LAYER 2</span>
                <span className="text-[11px] text-slate-400 font-medium">Terkalibrasi</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Machine Learning Klasik</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensemble LightGBM / GBDT dengan kalibrasi probabilitas Isotonic Regression dan penjelasan nilai TreeSHAP.
              </p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">LAYER 3</span>
                <span className="text-[11px] text-slate-400 font-medium">Multimodal</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Deep Learning PyTorch</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multimodal Late-Fusion (Tabular MCU MLP + Deret Waktu DCU GRU-D/TCN) serta Autoencoder deteksi anomali.
              </p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-rose-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">LAYER 4</span>
                <span className="text-[11px] text-slate-400 font-medium">Real-Time</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Daily Alerting & Kios</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peringatan lonjakan tensi akut pra-shift kerja, penentuan status kelayakan (Fit-for-Duty), dan protokol Medevac.
              </p>
            </div>

          </div>
        </div>

        {/* Role-Based Portals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-600" />
              <span>Pilih Portal Pengguna (Role-Based Access Control)</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Hak akses terpisah sesuai regulasi privasi UU PDP No. 27/2022</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Worker Portal */}
            <div className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pekerja Lapangan (Kios Mandiri DCU)</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Pengukuran mandiri tanda vital tensimeter dan oximeter sebelum shift kerja dimulai. Pantau status kelayakan kerja (Fit/Restriksi) harian secara mandiri.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Data Pribadi Mandiri
                </span>
                <Link
                  href="/kiosk"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
                >
                  <span>Buka Kios DCU</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Doctor Portal */}
            <div className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Dokter Perusahaan & Paramedik K3</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Akses rekam medis komprehensif, telaah atribusi faktor risiko dengan TreeSHAP, konfirmasi peringatan kritis, dan terbitkan rekomendasi restriksi kerja.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Akses Penuh Rekam Medis
                </span>
                <Link
                  href="/worker/W-00190"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
                >
                  <span>Pasien Kritis (Hendra)</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* HSSE Portal */}
            <div className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manajemen HR & Tim HSSE (K3)</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Dashboard analitik agregat populasi tenaga kerja, tren risiko kardiovaskular per departemen, dan tingkat kepatuhan skrining tanpa membuka rekam medis individual.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Agregat Terproteksi (k &ge; 5)
                </span>
                <Link
                  href="/population"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                >
                  <span>Dashboard Populasi</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Educational Insight: Kenapa Menggabungkan MCU + DCU? */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pentingnya Integrasi MCU Tahunan & DCU Harian dalam K3 Modern
              </h3>
              <p className="text-xs text-slate-500">Mengapa Medical Check-Up (MCU) tahunan saja tidak cukup untuk mencegah serangan jantung mendadak?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">Keterbatasan MCU Tahunan Konvensional</h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&#10005;</span>
                  <span><strong>Titik Data Tunggal:</strong> Dilakukan hanya 1 kali setahun; fluktuasi tekanan darah atau kelelahan akut sehari-hari tidak terekam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&#10005;</span>
                  <span><strong>Efek Jas Putih (White-Coat Effect):</strong> Tensi saat MCU di klinik sering tidak mencerminkan beban kerja fisik nyata di lapangan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&#10005;</span>
                  <span><strong>Keterlambatan Intervensi:</strong> Perburukan kondisi jantung antara interval 12 bulan tidak terdeteksi hingga terjadi insiden fatal.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-sm text-slate-900">Keunggulan Solusi Terpadu CardioWork</h4>
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&#10003;</span>
                  <span><strong>Pemantauan Pre-Shift 5 Menit (DCU):</strong> Mendeteksi lonjakan tensi (&ge;160 mmHg) sebelum pekerja naik rig, crane, atau mesin berat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&#10003;</span>
                  <span><strong>Multimodal Deep Learning:</strong> AI menggabungkan profil darah MCU (kolesterol, gula darah) dengan variabilitas tensi DCU 30 hari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&#10003;</span>
                  <span><strong>Zero-Downtime Decision Support:</strong> Dokter K3 langsung menerima peringatan otomatis untuk intervensi sebelum terjadi kegawatdaruratan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Patient Archetypes Demo Callout */}
        <div className="bg-gradient-to-r from-sky-50 via-white to-teal-50 border border-sky-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-700 font-bold bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                Demonstrasi Klinis Interaktif
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Eksplorasi Profil Pasien & Simulator Risiko What-If
              </h3>
              <p className="text-xs text-slate-600">
                Pilih profil pekerja di bawah ini untuk melihat evaluasi 4 layer model, riwayat MCU 3 tahun, grafik DCU 30 hari, dan simulator modifikasi gaya hidup:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            
            {/* Eko */}
            <Link
              href="/worker/W-00192"
              className="bg-white hover:bg-emerald-50/50 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">W-00192</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    FIT FOR DUTY
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-2">Eko Saputra (49 th)</div>
                <div className="text-xs text-slate-500 mt-0.5">Departemen Logistik • SBP Rata-rata: 118 mmHg</div>
                <div className="mt-2 text-xs text-emerald-700 font-medium">Risiko Framingham: 6.2% (Rendah)</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

            {/* Joko */}
            <Link
              href="/worker/W-00189"
              className="bg-white hover:bg-amber-50/50 p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">W-00189</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    RESTRIKSI RINGAN
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-2">Joko Wijaya (34 th)</div>
                <div className="text-xs text-slate-500 mt-0.5">Departemen Fabrikasi • SBP Rata-rata: 136 mmHg</div>
                <div className="mt-2 text-xs text-amber-700 font-medium">Risiko Framingham: 14.8% (Sedang)</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-amber-700 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

            {/* Hendra */}
            <Link
              href="/worker/W-00190"
              className="bg-white hover:bg-rose-50/50 p-4 rounded-xl border border-rose-200 hover:border-rose-400 transition shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">W-00190</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    UNFIT / KRITIS
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-2">Hendra Pangestu (53 th)</div>
                <div className="text-xs text-slate-500 mt-0.5">Departemen Pengeboran • SBP Rata-rata: 164 mmHg</div>
                <div className="mt-2 text-xs text-rose-700 font-medium">Risiko Framingham: 28.5% (Tinggi)</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-rose-700 flex items-center justify-between">
                <span>Buka Rekam Medis</span>
                <span className="group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Pusat Edukasi Kesehatan Kardiovaskular Interaktif */}
        <EducationalHealthGuide />

        {/* System Architecture & Status Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-600" />
              <span>Status Infrastruktur & Spesifikasi Sistem Serverless (Phase 1–8 Production Ready)</span>
            </h3>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Aktif & Terkalibrasi
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Web Framework:</span>
              <span className="text-slate-900 font-bold">Next.js 14 App Router</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Edge Inference:</span>
              <span className="text-emerald-700 font-bold">ONNX Runtime (Node/WASM)</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Cloud Database:</span>
              <span className="text-sky-700 font-bold">Neon Postgres Serverless</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Vercel Region:</span>
              <span className="text-indigo-700 font-bold">sin1 (Singapura)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
