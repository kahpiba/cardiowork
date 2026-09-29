'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingDown, 
  TrendingUp,
  Cigarette, 
  CigaretteOff, 
  Heart, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Flame,
  Award,
  Info
} from 'lucide-react';
import { 
  calculateFraminghamCvd, 
  calculateWhoSearoCvd, 
  calculateAscvdRisk 
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm tracking-wide">
                Simulator Intervensi "Bagaimana Jika?" (What-If Lifestyle & Therapy Simulator)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Geser parameter gaya hidup dan terapi untuk melihat proyeksi penurunan risiko kardiovaskular secara langsung.
              </p>
            </div>
          </div>
        </div>

        {isModified && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition font-bold shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset ke Data Asli</span>
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Controls on Left, Live Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Sliders & Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-slate-50/80 p-5 rounded-xl border border-slate-200">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Simulasi Modifikasi Faktor Risiko:
            </span>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold font-mono">
              Respon Instan (&lt;150ms)
            </span>
          </div>

          {/* 1. Smoking Cessation Toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-semibold flex items-center space-x-1.5">
                {isSmoker ? <Cigarette className="h-4 w-4 text-amber-600" /> : <CigaretteOff className="h-4 w-4 text-teal-600" />}
                <span>Program Berhenti Merokok (Smoking Cessation)</span>
              </span>
              <span className={`text-[11px] font-bold ${!simSmoker ? 'text-teal-700' : 'text-slate-500'}`}>
                {simSmoker ? 'Aktif Merokok' : 'Bebas Asap Rokok (Intervensi)'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSimSmoker(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  !simSmoker 
                    ? 'bg-teal-100 text-teal-900 border-teal-300 shadow-2xs ring-1 ring-teal-400' 
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                🚭 Berhenti Merokok Total
              </button>
              <button
                type="button"
                onClick={() => setSimSmoker(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  simSmoker 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs' 
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                Tetap Merokok
              </button>
            </div>
          </div>

          {/* 2. SBP Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-semibold flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-rose-600" />
                <span>Tekanan Darah Sistolik Target (Diet DASH & Obat)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
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
              className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Baseline ({systolicBp} mmHg)</span>
              <span>-20 mmHg (Target Normal)</span>
              <span>-40 mmHg (Maksimal)</span>
            </div>
          </div>

          {/* 3. Total Cholesterol Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-semibold flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                <span>Kolesterol Total (Diet Rendah Lemak / Terapi Statin)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
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
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Baseline ({totalCholesterol} mg/dL)</span>
              <span>-40 mg/dL</span>
              <span>-80 mg/dL (Target Optimal)</span>
            </div>
          </div>

          {/* 4. HDL Cholesterol Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-semibold flex items-center space-x-1.5">
                <Flame className="h-4 w-4 text-emerald-600" />
                <span>HDL Kolesterol Baik (Aktivitas Fisik Rutin 150 menit/minggu)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
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
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Baseline ({hdlCholesterol} mg/dL)</span>
              <span>+10 mg/dL</span>
              <span>+25 mg/dL (Protektif Tinggi)</span>
            </div>
          </div>

        </div>

        {/* Right: Outcome Impact Display (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-2xs">
          
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
              Perbandingan Skor Risiko (10-Tahun CVD):
            </span>

            {/* Before vs After Score Card */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              
              {/* Baseline */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold">KONDISI SAAT INI</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
                  {baselineFramingham.riskPercent10Yr}%
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  WHO: Tier {baselineWho.riskTier}
                </div>
              </div>

              {/* Simulated */}
              <div className={`p-3.5 rounded-xl border space-y-1 shadow-2xs transition-all ${
                simFramingham.riskPercent10Yr < baselineFramingham.riskPercent10Yr
                  ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-400/30'
                  : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] text-teal-800 block font-bold">HASIL PROYEKSI</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-teal-700 tabular-nums">
                  {simFramingham.riskPercent10Yr}%
                </div>
                <div className="text-[10px] text-teal-800 font-medium">
                  WHO: Tier {simWho.riskTier}
                </div>
              </div>

            </div>

            {/* The Reward Metric Delta Badge */}
            {absoluteReduction > 0 ? (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2.5 text-xs shadow-2xs animate-in fade-in duration-200">
                <div className="flex items-center space-x-1.5 text-teal-900 font-bold">
                  <TrendingDown className="h-4 w-4 text-teal-700" />
                  <span>Potensi Keuntungan Klinis Nyata (Clinical Gain):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div className="bg-white p-2.5 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-[10px] text-teal-700 font-semibold block">Penurunan Absolut</span>
                    <span className="text-lg font-black font-mono text-teal-700 tabular-nums">-{absoluteReduction}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-[10px] text-teal-700 font-semibold block">Penurunan Relatif</span>
                    <span className="text-lg font-black font-mono text-teal-700 tabular-nums">-{relativeReduction}%</span>
                  </div>
                </div>
                
                {/* Vascular Age Motivational Message */}
                <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-teal-950 leading-relaxed">
                    Setara dengan memulihkan usia elastisitas pembuluh darah (usia vaskular) sekitar <strong>{vascularAgeSaved} tahun lebih muda</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center space-x-2.5 shadow-2xs">
                <Shield className="h-5 w-5 text-slate-400 shrink-0" />
                <span className="leading-relaxed">
                  Geser slider target tensi/kolesterol atau ubah status merokok di sebelah kiri untuk melihat seberapa besar risiko kardiovaskular dapat diturunkan.
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Sesuai Panduan Konseling K3
            </span>
            <span className="text-teal-700 font-bold">EBM Guidelines</span>
          </div>

        </div>

      </div>

    </div>
  );
}
