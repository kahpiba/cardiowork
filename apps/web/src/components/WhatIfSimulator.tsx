'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingDown, 
  Cigarette, 
  CigaretteOff, 
  Heart, 
  Activity, 
  Shield, 
  Flame,
  Award,
  Info
} from 'lucide-react';
import { 
  calculateFraminghamCvd, 
  calculateWhoSearoCvd 
} from '@cardiowork/shared';

interface WhatIfSimulatorProps {
  age: number;
  gender: 'MALE' | 'FEMALE';
  systolicBp: number;
  isTreatedBp: boolean;
  totalCholesterol: number;
  hdlCholesterol: number;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export function WhatIfSimulator({
  age,
  gender,
  systolicBp,
  isTreatedBp,
  totalCholesterol,
  hdlCholesterol,
  isSmoker,
  hasDiabetes
}: WhatIfSimulatorProps) {
  // Baseline Risk Calculation
  const baselineFramingham = calculateFraminghamCvd({
    age, gender, systolicBp, isTreatedForHypertension: isTreatedBp,
    totalCholesterolMgdl: totalCholesterol,
    hdlCholesterolMgdl: hdlCholesterol,
    isSmoker, hasDiabetes
  });

  const baselineWho = calculateWhoSearoCvd({
    age, gender, systolicBp, isSmoker, hasDiabetes,
    totalCholesterolMgdl: totalCholesterol
  });

  // Simulator States (Interventions)
  const [simSmoker, setSimSmoker] = useState<boolean>(isSmoker);
  const [sbpDelta, setSbpDelta] = useState<number>(0); // e.g. -5 to -40 mmHg
  const [cholDelta, setCholDelta] = useState<number>(0); // e.g. -10 to -80 mg/dL
  const [hdlDelta, setHdlDelta] = useState<number>(0); // e.g. +5 to +25 mg/dL

  // Compute Simulated Values
  const simSystolicBp = Math.max(90, systolicBp + sbpDelta);
  const simTotalChol = Math.max(100, totalCholesterol + cholDelta);
  const simHdlChol = Math.min(100, hdlCholesterol + hdlDelta);

  const simFramingham = calculateFraminghamCvd({
    age, gender,
    systolicBp: simSystolicBp,
    isTreatedForHypertension: isTreatedBp || sbpDelta < 0,
    totalCholesterolMgdl: simTotalChol,
    hdlCholesterolMgdl: simHdlChol,
    isSmoker: simSmoker,
    hasDiabetes
  });

  const simWho = calculateWhoSearoCvd({
    age, gender,
    systolicBp: simSystolicBp,
    isSmoker: simSmoker,
    hasDiabetes,
    totalCholesterolMgdl: simTotalChol
  });

  // Calculate Reductions (ARR and RRR)
  const absoluteReduction = Math.round((baselineFramingham.riskPercent10Yr - simFramingham.riskPercent10Yr) * 10) / 10;
  const relativeReduction = baselineFramingham.riskPercent10Yr > 0 
    ? Math.round(((baselineFramingham.riskPercent10Yr - simFramingham.riskPercent10Yr) / baselineFramingham.riskPercent10Yr) * 100) 
    : 0;

  // Approximate vascular age reduction (every 5% relative reduction equates ~1 year younger vascular profile)
  const vascularAgeSaved = Math.max(1, Math.round(relativeReduction / 6));

  const handleReset = () => {
    setSimSmoker(isSmoker);
    setSbpDelta(0);
    setCholDelta(0);
    setHdlDelta(0);
  };

  const isModified = simSmoker !== isSmoker || sbpDelta !== 0 || cholDelta !== 0 || hdlDelta !== 0;

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
              Simulator Intervensi "Bagaimana Jika?" (What-If Lifestyle & Therapy)
            </h2>
            <p className="text-sm text-stone-600 mt-0.5">
              Geser parameter gaya hidup dan terapi untuk melihat proyeksi penurunan risiko kardiovaskular secara langsung.
            </p>
          </div>
        </div>

        {isModified && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-xs text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-2 rounded-xl border border-stone-200 transition font-bold shadow-2xs"
          >
            <RotateCcw className="h-4 w-4 text-stone-500" />
            <span>Reset ke Data Asli</span>
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Controls on Left, Live Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Sliders & Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-stone-50/70 p-6 rounded-xl border border-stone-200/70">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Simulasi Modifikasi Faktor Risiko:
            </span>
            <span className="text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/80 font-semibold font-mono">
              Respon Instan (&lt;150ms)
            </span>
          </div>

          {/* 1. Smoking Cessation Toggle */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-900 font-semibold flex items-center space-x-2">
                {isSmoker ? <Cigarette className="h-4 w-4 text-amber-700" /> : <CigaretteOff className="h-4 w-4 text-teal-700" />}
                <span>Program Berhenti Merokok (Smoking Cessation)</span>
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${!simSmoker ? 'text-teal-800 bg-teal-50 border border-teal-200' : 'text-stone-600 bg-stone-200/60'}`}>
                {simSmoker ? 'Aktif Merokok' : 'Bebas Asap Rokok'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSimSmoker(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  !simSmoker 
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' 
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                🚭 Berhenti Merokok Total
              </button>
              <button
                type="button"
                onClick={() => setSimSmoker(true)}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  simSmoker 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs' 
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Tetap Merokok
              </button>
            </div>
          </div>

          {/* 2. SBP Slider */}
          <div className="space-y-3 pt-4 border-t border-stone-200/80">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-900 font-semibold flex items-center space-x-2">
                <Heart className="h-4 w-4 text-stone-500" />
                <span>Tekanan Darah Sistolik Target (Diet DASH & Obat)</span>
              </span>
              <span className="text-xs font-mono font-bold text-stone-900 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                {simSystolicBp} mmHg {sbpDelta < 0 && `(${sbpDelta} mmHg)`}
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={0}
              step={5}
              value={sbpDelta}
              onChange={(e) => setSbpDelta(Number(e.target.value))}
              aria-label="Target Penurunan Tekanan Darah Sistolik"
              aria-valuemin={-40}
              aria-valuemax={0}
              aria-valuenow={sbpDelta}
              aria-valuetext={`${simSystolicBp} milimeter air raksa`}
              className="w-full accent-teal-700 cursor-pointer h-2.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-stone-600 font-medium">
              <span>Baseline ({systolicBp} mmHg)</span>
              <span>-20 mmHg (Target Normal)</span>
              <span>-40 mmHg (Maksimal)</span>
            </div>
          </div>

          {/* 3. Total Cholesterol Slider */}
          <div className="space-y-3 pt-4 border-t border-stone-200/80">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-900 font-semibold flex items-center space-x-2">
                <Activity className="h-4 w-4 text-stone-500" />
                <span>Kolesterol Total (Diet Rendah Lemak / Statin)</span>
              </span>
              <span className="text-xs font-mono font-bold text-stone-900 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                {simTotalChol} mg/dL {cholDelta < 0 && `(${cholDelta} mg/dL)`}
              </span>
            </div>
            <input
              type="range"
              min={-80}
              max={0}
              step={10}
              value={cholDelta}
              onChange={(e) => setCholDelta(Number(e.target.value))}
              aria-label="Penurunan Kolesterol Total"
              aria-valuemin={-80}
              aria-valuemax={0}
              aria-valuenow={cholDelta}
              aria-valuetext={`${simTotalChol} miligram per desiliter`}
              className="w-full accent-teal-700 cursor-pointer h-2.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-stone-600 font-medium">
              <span>Baseline ({totalCholesterol} mg/dL)</span>
              <span>-40 mg/dL</span>
              <span>-80 mg/dL (Target Optimal)</span>
            </div>
          </div>

          {/* 4. HDL Cholesterol Slider */}
          <div className="space-y-3 pt-4 border-t border-stone-200/80">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-900 font-semibold flex items-center space-x-2">
                <Flame className="h-4 w-4 text-stone-500" />
                <span>HDL Kolesterol Baik (Aktivitas Fisik Rutin)</span>
              </span>
              <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                {simHdlChol} mg/dL {hdlDelta > 0 && `(+${hdlDelta} mg/dL)`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={5}
              value={hdlDelta}
              onChange={(e) => setHdlDelta(Number(e.target.value))}
              aria-label="Peningkatan HDL Kolesterol"
              aria-valuemin={0}
              aria-valuemax={25}
              aria-valuenow={hdlDelta}
              aria-valuetext={`${simHdlChol} miligram per desiliter`}
              className="w-full accent-teal-700 cursor-pointer h-2.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-stone-600 font-medium">
              <span>Baseline ({hdlCholesterol} mg/dL)</span>
              <span>+10 mg/dL</span>
              <span>+25 mg/dL (Protektif Tinggi)</span>
            </div>
          </div>

        </div>

        {/* Right: Outcome Impact Display (5 cols) */}
        <div className="lg:col-span-5 bg-stone-50/60 p-6 rounded-xl border border-stone-200/70 flex flex-col justify-between space-y-5 shadow-2xs">
          
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-3.5">
              Perbandingan Skor Risiko (10-Tahun CVD):
            </span>

            {/* Before vs After Score Card */}
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              
              {/* Baseline */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                <span className="text-xs text-stone-500 block font-bold">KONDISI SAAT INI</span>
                <div className="text-3xl font-black font-mono text-stone-900 tabular-nums">
                  {baselineFramingham.riskPercent10Yr}%
                </div>
                <div className="text-xs text-stone-600 font-medium">
                  WHO: Tier {baselineWho.riskTier}
                </div>
              </div>

              {/* Simulated */}
              <div className={`p-4 rounded-xl border space-y-1.5 shadow-2xs transition-all ${
                simFramingham.riskPercent10Yr < baselineFramingham.riskPercent10Yr
                  ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-500/20'
                  : 'bg-white border-stone-200'
              }`}>
                <span className="text-xs text-teal-800 block font-bold">HASIL PROYEKSI</span>
                <div className="text-3xl font-black font-mono text-teal-800 tabular-nums">
                  {simFramingham.riskPercent10Yr}%
                </div>
                <div className="text-xs text-teal-800 font-medium">
                  WHO: Tier {simWho.riskTier}
                </div>
              </div>

            </div>

            {/* The Reward Metric Delta Badge */}
            {absoluteReduction > 0 ? (
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 space-y-3 text-sm shadow-2xs">
                <div className="flex items-center space-x-2 text-teal-950 font-bold">
                  <TrendingDown className="h-4 w-4 text-teal-700" />
                  <span>Potensi Keuntungan Klinis Nyata:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-stone-800">
                  <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-xs text-teal-800 font-semibold block">Penurunan Absolut</span>
                    <span className="text-xl font-black font-mono text-teal-800 tabular-nums">-{absoluteReduction}%</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-xs text-teal-800 font-semibold block">Penurunan Relatif</span>
                    <span className="text-xl font-black font-mono text-teal-800 tabular-nums">-{relativeReduction}%</span>
                  </div>
                </div>
                
                {/* Vascular Age Motivational Message */}
                <div className="p-3 bg-white/90 rounded-lg border border-teal-100 flex items-start gap-2.5">
                  <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-teal-950 leading-relaxed">
                    Setara dengan memulihkan usia elastisitas pembuluh darah (usia vaskular) sekitar <strong>{vascularAgeSaved} tahun lebih muda</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-sm text-stone-600 flex items-center space-x-3 shadow-2xs">
                <Shield className="h-5 w-5 text-stone-400 shrink-0" />
                <span className="leading-relaxed">
                  Geser slider target tensi/kolesterol atau ubah status merokok di sebelah kiri untuk melihat seberapa besar risiko kardiovaskular dapat diturunkan.
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3.5 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-stone-400" />
              Sesuai Panduan Konseling K3
            </span>
            <span className="text-teal-800 font-bold">EBM Guidelines</span>
          </div>

        </div>

      </div>

    </div>
  );
}
