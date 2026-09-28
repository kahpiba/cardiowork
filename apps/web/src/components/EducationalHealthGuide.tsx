'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Stethoscope, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Droplet,
  Sparkles,
  Zap
} from 'lucide-react';

export const EducationalHealthGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BP' | 'LIPID' | 'RED_FLAGS' | 'LIFESTYLE'>('BP');

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pusat Edukasi & Interpretasi Kesehatan Kardiovaskular K3</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                Panduan Medis
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Rujukan baku PERKI, JNC-7, ESC, dan Pedoman Penilaian Kelayakan Kerja Sektor Industri.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BP')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'BP' 
                ? 'bg-white text-rose-600 shadow-2xs font-bold border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tekanan Darah
          </button>
          <button
            onClick={() => setActiveTab('LIPID')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LIPID' 
                ? 'bg-white text-rose-600 shadow-2xs font-bold border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Lipid
          </button>
          <button
            onClick={() => setActiveTab('RED_FLAGS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'RED_FLAGS' 
                ? 'bg-white text-rose-600 shadow-2xs font-bold border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tanda Bahaya K3
          </button>
          <button
            onClick={() => setActiveTab('LIFESTYLE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LIFESTYLE' 
                ? 'bg-white text-rose-600 shadow-2xs font-bold border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gaya Hidup & Diet
          </button>
        </div>
      </div>

      {/* Content 1: Tekanan Darah */}
      {activeTab === 'BP' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="p-3.5 bg-sky-50/50 border border-sky-200/70 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Mengapa Tekanan Darah Penting di Tempat Kerja?</strong>
              <p className="mt-0.5 text-sky-800 leading-relaxed font-normal">
                Pekerja dengan hipertensi yang terpapar beban kerja fisik, cuaca panas ekstrem, atau shift malam memiliki risiko 3x lipat mengalami kejadian kardiovaskular akut pre-shift.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Optimal / Normal</span>
                <span className="text-xs font-mono font-bold text-emerald-800">&lt;120 / &lt;80</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Kondisi Ideal Kerja</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Pekerja bugar untuk segala jenis penugasan, termasuk pekerjaan ketinggian, confined space, dan shift rotasi.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pre-Hipertensi</span>
                <span className="text-xs font-mono font-bold text-amber-800">120–139 / 80–89</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Peringatan Awal</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Disarankan penyesuaian diet rendah garam (&lt;5g/hari), pantau DCU berkala 2x seminggu, batasi konsumsi kafein.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Hipertensi Derajat 1</span>
                <span className="text-xs font-mono font-bold text-orange-800">140–159 / 90–99</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Fit Dengan Catatan</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Wajib evaluasi farmakoterapi antihipertensi oleh dokter okupasi, pembatasan lembur malam beruntun.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Hipertensi Derajat 2 / Krisis</span>
                <span className="text-xs font-mono font-bold text-rose-800">&ge;160 / &ge;100</span>
              </div>
              <div className="text-xs font-bold text-rose-900">Unfit / Bahaya Akut</div>
              <p className="text-[11px] text-rose-800 leading-snug">
                Tunda shift kerja lapangan! Risiko tinggi diseksi aorta dan stroke akut. Wajib istirahat di klinik site seketika.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content 2: Profil Lipid */}
      {activeTab === 'LIPID' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Kolesterol Total</span>
                <span className="text-xs font-mono font-bold text-sky-700">&lt;200 mg/dL</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Jumlah total seluruh kolesterol dalam sirkulasi. &ge;240 mg/dL melipatgandakan risiko plak aterosklerosis.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">LDL ("Kolesterol Jahat")</span>
                <span className="text-xs font-mono font-bold text-rose-700">&lt;100 mg/dL</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Aterogenik primer yang menumpuk di dinding arteri koroner. Pada pekerja risiko tinggi, target klinis adalah &lt;70 mg/dL.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">HDL ("Kolesterol Baik")</span>
                <span className="text-xs font-mono font-bold text-emerald-700">&gt;40 (P) / &gt;50 (W)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Mengangkut kelebihan kolesterol kembali ke hati (*reverse cholesterol transport*). Semakin tinggi, semakin protektif.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">Trigliserida & Rasio</span>
                <span className="text-xs font-mono font-bold text-amber-700">&lt;150 mg/dL</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Terkait konsumsi karbohidrat olahan dan sindrom metabolik. Rasio Trigliserida/HDL &gt;3.0 mengindikasikan resistensi insulin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content 3: Tanda Bahaya K3 */}
      {activeTab === 'RED_FLAGS' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Gejala Angina Tipikal (Iskemia Jantung)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Nyeri dada terasa seperti tertindih beban berat atau rasa terbakar di dada kiri/tengah yang menjalar ke rahang, leher, atau lengan kiri. Wajib segera dievakuasi ke IGD/RS rujukan.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Desaturasi Oksigen & Detak Aritmia</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Saturasi oksigen (SpO2) pre-shift &lt;92% atau denyut nadi istirahat &gt;110 bpm / &lt;45 bpm dengan rasa melayang (*dizziness*). Dilarang keras mengoperasikan alat berat atau bekerja di ketinggian.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content 4: Gaya Hidup & Diet */}
      {activeTab === 'LIFESTYLE' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diet DASH Pekerja</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tingkatkan sayur, buah, kacang-kacangan, dan ikan berminyak (omega-3). Batasi natrium &lt;2000 mg/hari (1 sendok teh garam dapur).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Manajemen Tidur Shift Malam</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Usahakan tidur minimal 7 jam per 24 jam dengan kamar gelap dan sejuk setelah shift malam. Hindari kafein 4 jam sebelum jam istirahat.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Berhenti Merokok (Smoking Cessation)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dalam 1 tahun setelah berhenti merokok, kelebihan risiko penyakit jantung koroner menurun hingga 50% dibandingkan perokok aktif.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
