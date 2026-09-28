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
  AlertTriangle 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
          <Activity className="h-3.5 w-3.5" />
          <span>Occupational Health & Clinical Decision Support System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
          CardioWork — Prediksi Risiko Kardiovaskular Pekerja
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Mengintegrasikan rekam medis tahunan (MCU) dan pemantauan tanda vital harian sebelum shift (DCU) menggunakan arsitektur inferensi bertingkat (Layer 1–4) berbasis Edge AI Serverless.
        </p>
      </div>

      {/* 4 Multi-Tier Engine Badges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-mono text-sky-400 font-bold">LAYER 1</div>
          <div className="font-bold text-slate-100 text-sm">Skor Klinis Established</div>
          <p className="text-xs text-slate-400 leading-snug">
            Framingham 10-Yr, WHO/ISH SEARO chart, & ASCVD PCE transparan.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-mono text-teal-400 font-bold">LAYER 2</div>
          <div className="font-bold text-slate-100 text-sm">Machine Learning Klasik</div>
          <p className="text-xs text-slate-400 leading-snug">
            Ensemble GBDT / LightGBM baseline pembanding terkalibrasi.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-mono text-indigo-400 font-bold">LAYER 3</div>
          <div className="font-bold text-slate-100 text-sm">Deep Learning PyTorch</div>
          <p className="text-xs text-slate-400 leading-snug">
            Multimodal Fusion (MCU MLP + DCU GRU-D / TCN) + Autoencoder Anomaly.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-mono text-rose-400 font-bold">LAYER 4</div>
          <div className="font-bold text-slate-100 text-sm">Daily Alerting & Kios</div>
          <p className="text-xs text-slate-400 leading-snug">
            Deteksi dini lonjakan hemodinamik & kios cek mandiri pekerja.
          </p>
        </div>

      </div>

      {/* Role-Based Navigation Portals */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Users className="h-5 w-5 text-sky-400" />
          <span>Pilih Portal Pengguna (Role-Based Access Control)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Worker / Self-Service */}
          <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 transition space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Pekerja (Kios Mandiri DCU)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Input mandiri tanda vital tensimeter & oximeter sebelum shift, lihat riwayat pribadi & status fit-for-work.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Akses Data Pribadi Saja
              </span>
            </div>
          </div>

          {/* Doctor / Paramedic */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 transition space-y-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Dokter Perusahaan & Paramedis</h3>
              <p className="text-xs text-slate-400 mt-1">
                Akses rekam medis lengkap, telaah atribusi SHAP, konfirmasi alert kritis, dan buat keputusan restriksi kerja.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                Akses Penuh Klinis
              </span>
              <Link 
                href="/worker/W-00190" 
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
              >
                Buka Pasien Kritis &rarr;
              </Link>
            </div>
          </div>

          {/* HSSE & Management */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Tim K3 & HR Manajemen</h3>
              <p className="text-xs text-slate-400 mt-1">
                Dashboard populasi agregat, tren risiko per departemen, kepatuhan MCU/DCU, tanpa data rekam medis individual.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Small-Cell Suppression (&lt;5)
              </span>
            </div>
          </div>

        </div>

        {/* Phase 3 Live Demo Callout */}
        <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-teal-950/60 border border-sky-800/40 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                Phase 3 Live Feature
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Dashboard Klinis Individu Pekerja & What-If Risk Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Pilih salah satu profil pekerja di bawah ini untuk melihat evaluasi Layer 1 (Framingham, WHO SEARO, ASCVD), tren longitudinal MCU 3 tahun, dan grafik hemodinamik harian DCU 30 hari:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              href="/worker/W-00192"
              className="bg-slate-950/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono font-bold text-xs text-slate-200">W-00192</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Eko Saputra (49 th) • Risiko Rendah / Fit</div>
              </div>
              <span className="text-emerald-400 group-hover:translate-x-1 transition text-xs font-bold">&rarr;</span>
            </Link>

            <Link
              href="/worker/W-00189"
              className="bg-slate-950/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <span className="font-mono font-bold text-xs text-slate-200">W-00189</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Joko Wijaya (34 th) • Risiko Sedang / Borderline</div>
              </div>
              <span className="text-amber-400 group-hover:translate-x-1 transition text-xs font-bold">&rarr;</span>
            </Link>

            <Link
              href="/worker/W-00190"
              className="bg-slate-950/80 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
                  <span className="font-mono font-bold text-xs text-slate-200">W-00190</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Hendra Pangestu (53 th) • Risiko Tinggi / Unfit</div>
              </div>
              <span className="text-rose-400 group-hover:translate-x-1 transition text-xs font-bold">&rarr;</span>
            </Link>
          </div>
        </div>

      </div>

      {/* System Status & Architecture Highlights */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-sky-400" />
          <span>Status Lingkungan & Arsitektur Serverless Vercel (Phase 1 Foundation)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Framework:</span>
            <span className="text-slate-200">Next.js 14 App Router</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Inference Engine:</span>
            <span className="text-emerald-400">ONNX Runtime (Node/WASM)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Database:</span>
            <span className="text-sky-400">Neon Serverless Postgres</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Vercel Region:</span>
            <span className="text-amber-400">sin1 (Singapura)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
