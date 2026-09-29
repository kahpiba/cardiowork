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

  const ciMargin = Math.max(1.8, Math.round(whoSearo.riskPercentContinuous * 0.15 * 10) / 10);
  const ciLower = Math.max(1.0, Math.round((whoSearo.riskPercentContinuous - ciMargin) * 10) / 10);
  const ciUpper = Math.min(60.0, Math.round((whoSearo.riskPercentContinuous + ciMargin) * 10) / 10);

  const framinghamIsHigh = framingham.riskPercent10Yr >= 20;
  const framinghamIsMod = framingham.riskPercent10Yr >= 10 && framingham.riskPercent10Yr < 20;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-2xs">
            <Heart className="h-5 w-5 text-teal-700 animate-heartbeat" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base tracking-wide">
              Layer 1 — Skor Klinis Baku (Established Clinical Guidelines)
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">Evaluasi risiko awal berbasis rekam medis MCU tahunan terstandarisasi.</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 font-semibold flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. WHO SEARO Dual-Engine Card */}
          <div className="sm:col-span-2 bg-teal-50/70 p-5 rounded-xl border border-teal-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-teal-950">WHO/ISH SEARO (Dual-Engine)</span>
                  <span className="text-xs font-bold bg-teal-100/80 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-300">
                    Acuan Utama RI
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  whoSearo.riskTier === '>=40%' || whoSearo.riskTier === '30%-<40%' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                  whoSearo.riskTier === '20%-<30%' ? 'bg-orange-100 text-orange-900 border-orange-300' :
                  whoSearo.riskTier === '10%-<20%' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  'bg-teal-100 text-teal-900 border-teal-300'
                }`}>
                  Tier {whoSearo.riskTier}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2.5">
                <span className="text-3xl font-black font-mono text-teal-900 tabular-nums">
                  {whoSearo.riskPercentContinuous}%
                </span>
                <span className="text-sm text-teal-800 font-medium">
                  probabilitas kejadian 10-tahun
                </span>
              </div>
              <div className="text-xs text-teal-900 bg-white/90 px-3 py-2 rounded-lg border border-teal-200 mt-2.5 font-mono flex flex-wrap gap-2.5">
                <span>Matriks WHO 2007: <strong className="text-teal-950">{whoSearo.who2007MatrixTier}</strong></span>
                <span>•</span>
                <span>Regresi WHO 2019: <strong className="text-teal-950">{whoSearo.who2019EquationPercent}%</strong></span>
              </div>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              Dikalibrasi khusus untuk profil epidemiologi populasi pekerja Asia Tenggara (Sub-Region D).
            </p>
          </div>

          {/* 2. Framingham General CVD */}
          <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-stone-900">Framingham General CVD</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  framinghamIsHigh ? 'bg-rose-100 text-rose-900 border-rose-300' :
                  framinghamIsMod ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  'bg-teal-100 text-teal-900 border-teal-300'
                }`}>
                  {framingham.riskCategory}
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-stone-900 mt-2.5 tabular-nums">
                {framingham.riskPercent10Yr}%
              </div>
              <div className="mt-2.5 space-y-1">
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-teal-600 h-full" style={{ width: '25%' }} title="Rendah (<10%)" />
                  <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="Sedang (10-20%)" />
                  <div className="bg-rose-600 h-full" style={{ width: '50%' }} title="Tinggi (>20%)" />
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Standar kohort Circulation 2008 untuk prediksi PJK, stroke, dan gagal jantung.
            </p>
          </div>

          {/* 3. ASCVD ACC/AHA */}
          <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-stone-900">ASCVD Pooled Cohort</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-stone-300 bg-stone-200 text-stone-800">
                  {ascvd.riskCategory}
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-stone-900 mt-2.5 tabular-nums">
                {ascvd.riskPercent10Yr}%
              </div>
              <div className="text-xs text-amber-950 bg-amber-50/90 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 mt-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Kecenderungan overestimasi pada populasi Asia</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Standar ACC/AHA 2013 untuk komparasi klinis internasional.
            </p>
          </div>

        </div>

      </div>

      {/* Asian Overestimation Caution Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 text-sm text-amber-950 space-y-1.5 shadow-2xs">
        <div className="font-bold flex items-center space-x-2 text-amber-950">
          <Info className="h-4 w-4 shrink-0 text-amber-700" />
          <span>Panduan Klinis Penggunaan Skor Baku bagi Dokter Perusahaan & Tenaga K3:</span>
        </div>
        <p className="leading-relaxed text-xs sm:text-sm text-amber-900">
          Untuk tenaga kerja di Indonesia, utamakan <strong>WHO/ISH SEARO Chart</strong> sebagai acuan panduan utama. Formula Framingham dan ASCVD ACC/AHA menggunakan data awal berbasis populasi Barat sehingga sering memberikan estimasi yang lebih tinggi. Seluruh skor di atas merupakan baseline klinis statis yang akan disempurnakan oleh pemantauan DCU harian (Layer 3 & 4).
        </p>
      </div>

      {/* Citations & Limitations Toggle */}
      <div className="pt-1">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-teal-800 hover:text-teal-900 flex items-center space-x-1.5 transition font-bold"
        >
          <BookOpen className="h-4 w-4" />
          <span>{showDetails ? 'Sembunyikan Rujukan Klinis & Batasan Formula' : 'Tampilkan Sumber Publikasi Ilmiah & Batasan Formula'}</span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-3.5">
            <div>
              <strong className="text-stone-900 block font-bold">1. WHO/ISH Risk Prediction Charts (SEARO Sub-region D):</strong>
              <p className="text-xs leading-relaxed text-stone-600 mt-0.5">
                WHO & International Society of Hypertension. Geneva, 2007; WHO CVD Risk Chart Working Group, Lancet Global Health 2019. Dikalibrasi untuk mortalitas kardiovaskular regional Indonesia & Asia Tenggara.
              </p>
            </div>
            <div>
              <strong className="text-stone-900 block font-bold">2. Framingham General CVD (Circulation 2008):</strong>
              <p className="text-xs leading-relaxed text-stone-600 mt-0.5">
                D'Agostino RB Sr, et al. Circulation. 2008;117(6):743-753. Batasan: Usia 30–74 tahun. Tidak memodelkan pola kerja shift rotasi malam hari.
              </p>
            </div>
            <div>
              <strong className="text-stone-900 block font-bold">3. 2013 ACC/AHA ASCVD Risk Estimator:</strong>
              <p className="text-xs leading-relaxed text-stone-600 mt-0.5">
                Goff DC Jr, et al. Circulation. 2014;129(25 Suppl 2):S49-S73. Batasan: Validasi kohort White & African American.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
