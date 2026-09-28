'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  HelpCircle, 
  AlertTriangle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';
import { 
  calculateFraminghamCvd, 
  calculateWhoSearoCvd, 
  calculateAscvdRisk 
} from '@cardiowork/shared';

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

  let framinghamColor = 'text-emerald-800 bg-emerald-100 border-emerald-200';
  if (framingham.riskCategory === 'MODERATE') framinghamColor = 'text-amber-800 bg-amber-100 border-amber-200';
  if (framingham.riskCategory === 'HIGH') framinghamColor = 'text-rose-800 bg-rose-100 border-rose-200';

  let whoColor = 'text-emerald-800 bg-emerald-100 border-emerald-200';
  if (whoSearo.riskTier === '10%-<20%') whoColor = 'text-amber-800 bg-amber-100 border-amber-200';
  if (whoSearo.riskTier === '20%-<30%' || whoSearo.riskTier === '30%-<40%') whoColor = 'text-orange-800 bg-orange-100 border-orange-200';
  if (whoSearo.riskTier === '>=40%') whoColor = 'text-rose-800 bg-rose-100 border-rose-200';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-rose-600 animate-heartbeat" />
          <h2 className="font-bold text-slate-900 text-sm tracking-wide">
            Layer 1 — Skor Klinis Baku (Established Clinical Formulas)
          </h2>
        </div>
        <span className="text-[11px] font-mono bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200 font-semibold">
          Transparan & Non-Black-Box
        </span>
      </div>

      {/* 3 Clinical Scores Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Framingham General CVD */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-700">Framingham General CVD</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${framinghamColor}`}>
                {framingham.riskCategory}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
              {framingham.riskPercent10Yr}%
            </div>
            
            {/* Visual Risk Gauge Bar */}
            <div className="mt-2 space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '10%' }} title="Rendah (<10%)"></div>
                <div className="bg-amber-500 h-full" style={{ width: '10%' }} title="Sedang (10-20%)"></div>
                <div className="bg-rose-500 h-full" style={{ width: '80%' }} title="Tinggi (>20%)"></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0% Rendah</span>
                <span>10%</span>
                <span>20% Tinggi</span>
                <span>&gt;30%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 mt-1 leading-snug">
            Probabilitas kejadian kardiovaskular 10-tahun (PJK, stroke, gagal jantung, PAD).
          </div>
        </div>

        {/* 2. WHO/ISH SEARO Chart */}
        <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-teal-900">WHO SEARO (Dual-Engine)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${whoColor}`}>
                Tier {whoSearo.riskTier}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-teal-800">
                {whoSearo.riskTier}
              </span>
              <span className="text-xs font-bold text-teal-700 font-mono bg-teal-100/60 px-2 py-0.5 rounded-md">
                ~{whoSearo.riskPercentContinuous}% (2019)
              </span>
            </div>
            <div className="text-[10px] text-teal-800 bg-white/80 px-2 py-1 rounded border border-teal-200 mt-2 font-medium">
              Matriks WHO 2007: <span className="font-bold">{whoSearo.who2007MatrixTier}</span> • Regresi WHO 2019: <span className="font-bold">{whoSearo.who2019EquationPercent}%</span>
            </div>
          </div>

          <div className="text-[11px] text-teal-800/80 mt-1 leading-snug">
            Standar emas regional Indonesia & Asia Tenggara (SEARO sub-region D).
          </div>
        </div>

        {/* 3. ASCVD ACC/AHA */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-700">ASCVD Pooled Cohort</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 bg-slate-200 text-slate-800">
                {ascvd.riskCategory}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
              {ascvd.riskPercent10Yr}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
              <span>Kecenderungan overestimasi pada populasi Asia</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-snug">
              Standar primer AHA/ACC 2013 untuk komparasi klinis internasional.
            </div>
          </div>
        </div>

      </div>

      {/* Asian Overestimation Caution Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1 shadow-2xs">
        <div className="font-bold flex items-center space-x-1.5 text-amber-900">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Panduan Klinis untuk Dokter Perusahaan & Tenaga K3:</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-800">
          Untuk tenaga kerja di Indonesia, utamakan <strong>WHO/ISH SEARO Chart</strong> sebagai acuan panduan utama. Formula Framingham dan ASCVD ACC/AHA menggunakan data awal berbasis populasi Barat sehingga sering memberikan estimasi yang lebih tinggi. Seluruh skor di atas merupakan baseline klinis statis yang akan disempurnakan oleh pemantauan DCU harian (Layer 3 & 4).
        </p>
      </div>

      {/* Citations & Limitations Toggle */}
      <div className="pt-1">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-sky-700 hover:text-sky-800 flex items-center space-x-1 transition font-bold"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{showDetails ? 'Sembunyikan Rujukan Klinis & Batasan Formula' : 'Tampilkan Sumber Publikasi Ilmiah & Batasan Formula'}</span>
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <div>
              <strong className="text-slate-900 block">1. Framingham General CVD (Circulation 2008):</strong>
              <p className="text-[11px] leading-relaxed">
                D'Agostino RB Sr, et al. Circulation. 2008;117(6):743-753. Batasan: Usia 30–74 tahun. Tidak memodelkan pola kerja shift rotasi malam hari.
              </p>
            </div>
            <div>
              <strong className="text-slate-900 block">2. WHO/ISH Risk Prediction Charts (SEARO):</strong>
              <p className="text-[11px] leading-relaxed">
                WHO & International Society of Hypertension. Geneva, 2007; Lancet Global Health 2019. Dikalibrasi untuk mortalitas kardiovaskular sub-region D Asia Tenggara.
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
