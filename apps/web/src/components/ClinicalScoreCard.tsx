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

  let framinghamColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (framingham.riskCategory === 'MODERATE') framinghamColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (framingham.riskCategory === 'HIGH') framinghamColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  let whoColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (whoSearo.riskTier === '10%-<20%') whoColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (whoSearo.riskTier === '20%-<30%' || whoSearo.riskTier === '30%-<40%') whoColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  if (whoSearo.riskTier === '>=40%') whoColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h2 className="font-bold text-slate-100 text-sm tracking-wide">
            Layer 1 — Skor Klinis Baku (Established Clinical Formulas)
          </h2>
        </div>
        <span className="text-[11px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
          Transparan & Non-Black-Box
        </span>
      </div>

      {/* 3 Clinical Scores Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Framingham General CVD */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Framingham General CVD</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${framinghamColor}`}>
              {framingham.riskCategory}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {framingham.riskPercent10Yr}%
          </div>
          <div className="text-[11px] text-slate-400">
            Probabilitas kejadian kardiovaskular 10-tahun (PJK, stroke, gagal jantung, PAD).
          </div>
        </div>

        {/* 2. WHO/ISH SEARO Chart */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-teal-400">WHO/ISH SEARO Chart</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${whoColor}`}>
              Tier {whoSearo.riskTier}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-teal-300">
            {whoSearo.riskTier}
          </div>
          <div className="text-[11px] text-slate-400">
            Dikalibrasi khusus kawasan regional Asia Tenggara (Indonesia, sub-region SEARO D).
          </div>
        </div>

        {/* 3. ASCVD ACC/AHA */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">ASCVD Pooled Cohort</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
              {ascvd.riskCategory}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {ascvd.riskPercent10Yr}%
          </div>
          <div className="text-[11px] text-amber-400/90 flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Kecenderungan overestimasi Asia</span>
          </div>
        </div>

      </div>

      {/* Asian Overestimation Caution Box */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-200/90 space-y-1">
        <div className="font-semibold flex items-center space-x-1.5 text-amber-300">
          <Info className="h-4 w-4 shrink-0" />
          <span>Catatan Kepatuhan Klinis untuk Tenaga Kesehatan K3:</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-300">
          Untuk populasi tenaga kerja di Indonesia, gunakan <strong>WHO/ISH SEARO Chart</strong> sebagai acuan panduan utama. Skor Framingham dan ASCVD ACC/AHA cenderung memproyeksikan estimasi yang lebih tinggi karena basis data epidemiologi Kaukasia. Seluruh skor di atas merupakan baseline konvensional yang akan dilengkapi oleh model sekuensial DCU (Layer 3).
        </p>
      </div>

      {/* Citations & Limitations Toggle */}
      <div className="pt-1">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 transition font-medium"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{showDetails ? 'Sembunyikan Rujukan Klinis & Batasan Formula' : 'Tampilkan Sumber Publikasi Ilmiah & Batasan Formula'}</span>
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-3">
            <div>
              <strong className="text-slate-200 block">1. Framingham General CVD (Circulation 2008):</strong>
              <p className="text-[11px] leading-relaxed">
                D'Agostino RB Sr, et al. Circulation. 2008;117(6):743-753. Batasan: Usia 30–74 tahun. Tidak memodelkan pola kerja shift rotasi malam hari.
              </p>
            </div>
            <div>
              <strong className="text-slate-200 block">2. WHO/ISH Risk Prediction Charts (SEARO):</strong>
              <p className="text-[11px] leading-relaxed">
                WHO & International Society of Hypertension. Geneva, 2007; Lancet Global Health 2019. Dikalibrasi untuk mortalitas kardiovaskular sub-region D Asia Tenggara.
              </p>
            </div>
            <div>
              <strong className="text-slate-200 block">3. 2013 ACC/AHA ASCVD Risk Estimator:</strong>
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
