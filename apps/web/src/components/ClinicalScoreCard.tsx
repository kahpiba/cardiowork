'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  HelpCircle, 
  AlertTriangle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  calculateFraminghamCvd, 
  calculateWhoSearoCvd, 
  calculateAscvdRisk 
} from '@cardiowork/shared';
import { RadialRiskGauge } from '@/components/RadialRiskGauge';

interface ClinicalScoreCardProps {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isTreatedBp: boolean;
  totalCholesterol: number;
  hdlCholesterol: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export function ClinicalScoreCard({
  age,
  gender,
  systolicBp,
  isTreatedBp,
  totalCholesterol,
  hdlCholesterol,
  isSmoker,
  hasDiabetes
}: ClinicalScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Kalkulasi Skor Layer 1
  const framingham = calculateFraminghamCvd({
    age, gender, systolicBp, isTreatedForHypertension: isTreatedBp,
    totalCholesterolMgdl: totalCholesterol,
    hdlCholesterolMgdl: hdlCholesterol,
    isSmoker, hasDiabetes
  });

  const whoSearo = calculateWhoSearoCvd({
    age, gender, systolicBp, isSmoker, hasDiabetes,
    totalCholesterolMgdl: totalCholesterol
  });

  const ascvd = calculateAscvdRisk({
    age, gender, systolicBp, isTreatedForHypertension: isTreatedBp,
    totalCholesterolMgdl: totalCholesterol,
    hdlCholesterolMgdl: hdlCholesterol,
    isSmoker, hasDiabetes
  });

  // Calculate 95% Confidence Interval approximate
  const ciMargin = Math.max(1.8, Math.round(whoSearo.riskPercentContinuous * 0.15 * 10) / 10);
  const ciLower = Math.max(1.0, Math.round((whoSearo.riskPercentContinuous - ciMargin) * 10) / 10);
  const ciUpper = Math.min(60.0, Math.round((whoSearo.riskPercentContinuous + ciMargin) * 10) / 10);

  // Dual-channel tags for Framingham
  const framinghamIsHigh = framingham.riskPercent10Yr >= 20;
  const framinghamIsMod = framingham.riskPercent10Yr >= 10 && framingham.riskPercent10Yr < 20;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-2xs">
            <Heart className="h-4 w-4 text-teal-600 animate-heartbeat" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm tracking-wide">
              Layer 1 — Skor Klinis Baku (Established Clinical Guidelines)
            </h2>
            <p className="text-xs text-slate-500">Evaluasi risiko awal berbasis rekam medis MCU tahunan terstandarisasi.</p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-bold flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3 h-3 text-teal-600" />
          Transparan & Non-Black-Box
        </span>
      </div>

      {/* Grid: Radial Gauge on Left + 3 Clinical Formula Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Interactive Radial Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <RadialRiskGauge
            scorePercent={whoSearo.riskPercentContinuous}
            confidenceInterval={{ lower: ciLower, upper: ciUpper }}
            label="Skor Risiko Regional (WHO SEARO)"
            subtitle="Pedoman Emas Asia Tenggara"
            size="md"
          />
        </div>

        {/* Right: Comparative Formula Breakdown (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* 1. WHO SEARO Dual-Engine Card */}
          <div className="sm:col-span-2 bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-teal-950">WHO/ISH SEARO (Dual-Engine)</span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-300">
                    Acuan Utama RI
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  whoSearo.riskTier === '>=40%' || whoSearo.riskTier === '30%-<40%' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  whoSearo.riskTier === '20%-<30%' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  whoSearo.riskTier === '10%-<20%' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-teal-100 text-teal-800 border-teal-200'
                }`}>
                  Tier {whoSearo.riskTier}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black font-mono text-teal-800 tabular-nums">
                  {whoSearo.riskPercentContinuous}%
                </span>
                <span className="text-xs text-teal-700 font-semibold font-sans">
                  probabilitas kejadian 10-tahun
                </span>
              </div>
              <div className="text-[11px] text-teal-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-teal-200 mt-2 font-mono flex flex-wrap gap-2">
                <span>Matriks WHO 2007: <strong className="text-teal-950">{whoSearo.who2007MatrixTier}</strong></span>
                <span>•</span>
                <span>Regresi WHO 2019: <strong className="text-teal-950">{whoSearo.who2019EquationPercent}%</strong></span>
              </div>
            </div>
            <p className="text-[11px] text-teal-800/90 mt-1 leading-snug">
              Dikalibrasi khusus untuk profil epidemiologi populasi pekerja Asia Tenggara (Sub-Region D).
            </p>
          </div>

          {/* 2. Framingham General CVD */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">Framingham General CVD</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  framinghamIsHigh ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  framinghamIsMod ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {framingham.riskCategory}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-2 tabular-nums">
                {framingham.riskPercent10Yr}%
              </div>
              {/* Progress track */}
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: '25%' }} title="Rendah (<10%)" />
                  <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="Sedang (10-20%)" />
                  <div className="bg-rose-500 h-full" style={{ width: '50%' }} title="Tinggi (>20%)" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Standar kohort Circulation 2008 untuk prediksi PJK, stroke, dan gagal jantung.
            </p>
          </div>

          {/* 3. ASCVD ACC/AHA */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">ASCVD Pooled Cohort</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 bg-slate-200 text-slate-800">
                  {ascvd.riskCategory}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-2 tabular-nums">
                {ascvd.riskPercent10Yr}%
              </div>
              <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center gap-1 mt-2">
                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                <span>Kecenderungan overestimasi pada Asia</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Standar ACC/AHA 2013 untuk komparasi klinis internasional.
            </p>
          </div>

        </div>

      </div>

      {/* Asian Overestimation Caution Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1 shadow-2xs">
        <div className="font-bold flex items-center space-x-1.5 text-amber-900">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Panduan Klinis Penggunaan Skor Baku bagi Dokter Perusahaan & Tenaga K3:</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-800">
          Untuk tenaga kerja di Indonesia, utamakan <strong>WHO/ISH SEARO Chart</strong> sebagai acuan panduan utama. Formula Framingham dan ASCVD ACC/AHA menggunakan data awal berbasis populasi Barat sehingga sering memberikan estimasi yang lebih tinggi. Seluruh skor di atas merupakan baseline klinis statis yang akan disempurnakan oleh pemantauan DCU harian (Layer 3 & 4).
        </p>
      </div>

      {/* Citations & Limitations Toggle */}
      <div className="pt-1">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-teal-700 hover:text-teal-800 flex items-center space-x-1 transition font-bold"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{showDetails ? 'Sembunyikan Rujukan Klinis & Batasan Formula' : 'Tampilkan Sumber Publikasi Ilmiah & Batasan Formula'}</span>
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <div>
              <strong className="text-slate-900 block">1. WHO/ISH Risk Prediction Charts (SEARO Sub-region D):</strong>
              <p className="text-[11px] leading-relaxed">
                WHO & International Society of Hypertension. Geneva, 2007; WHO CVD Risk Chart Working Group, Lancet Global Health 2019. Dikalibrasi untuk mortalitas kardiovaskular regional Indonesia & Asia Tenggara.
              </p>
            </div>
            <div>
              <strong className="text-slate-900 block">2. Framingham General CVD (Circulation 2008):</strong>
              <p className="text-[11px] leading-relaxed">
                D'Agostino RB Sr, et al. Circulation. 2008;117(6):743-753. Batasan: Usia 30–74 tahun. Tidak memodelkan pola kerja shift rotasi malam hari.
              </p>
            </div>
            <div>
              <strong className="text-slate-900 block">3. 2013 ACC/AHA ASCVD Risk Estimator:</strong>
              <p className="text-[11px] leading-relaxed">
                Goff DC Jr, et al. Circulation. 2014;129(25 Suppl 2):S49-S73. Batasan: Validasi kohort White & African American.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
