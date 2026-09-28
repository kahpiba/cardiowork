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
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Flame 
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
  // Baseline Risk
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
  const [sbpDelta, setSbpDelta] = useState<number>(0); // e.g. -10 to -40 mmHg
  const [cholDelta, setCholDelta] = useState<number>(0); // e.g. -20 to -80 mg/dL
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

  // Calculate Reductions
  const absoluteReduction = Math.round((baselineFramingham.riskPercent10Yr - simFramingham.riskPercent10Yr) * 10) / 10;
  const relativeReduction = baselineFramingham.riskPercent10Yr > 0 
    ? Math.round(((baselineFramingham.riskPercent10Yr - simFramingham.riskPercent10Yr) / baselineFramingham.riskPercent10Yr) * 100) 
    : 0;

  const handleReset = () => {
    setSimSmoker(isSmoker);
    setSbpDelta(0);
    setCholDelta(0);
    setHdlDelta(0);
  };

  const isModified = simSmoker !== isSmoker || sbpDelta !== 0 || cholDelta !== 0 || hdlDelta !== 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm tracking-wide">
              Simulator Intervensi Gaya Hidup & Terapi ("What-If" Risk Simulator)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulasi dampak modifikasi faktor risiko terhadap penurunan probabilitas kejadian kardiovaskular 10-tahun.
          </p>
        </div>

        {isModified && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Intervensi</span>
          </button>
        )}
      </div>

      {/* Main Grid: Sliders on Left, Impact Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800">
          
          <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
            Rencana Intervensi Perilaku & Medis K3:
          </span>

          {/* 1. Smoking Cessation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                {isSmoker ? <Cigarette className="h-4 w-4 text-amber-400" /> : <CigaretteOff className="h-4 w-4 text-emerald-400" />}
                <span>Program Penghentian Merokok (Smoking Cessation)</span>
              </span>
              <span className={`text-[11px] font-bold ${!simSmoker ? 'text-emerald-400' : 'text-slate-400'}`}>
                {simSmoker ? 'Masih Merokok' : 'Berhenti Merokok'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSimSmoker(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  !simSmoker 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                🚭 Berhenti Total (Bebas Asap Rokok)
              </button>
              <button
                type="button"
                onClick={() => setSimSmoker(true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  simSmoker 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Tetap Merokok
              </button>
            </div>
          </div>

          {/* 2. SBP Reduction Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-rose-400" />
                <span>Target Penurunan Tekanan Sistolik (SBP)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-300">
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
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline ({systolicBp} mmHg)</span>
              <span>-20 mmHg (Diet DASH & Obat)</span>
              <span>-40 mmHg (Maksimal)</span>
            </div>
          </div>

          {/* 3. Total Cholesterol Reduction Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-teal-400" />
                <span>Penurunan Kolesterol Total (Diet Rendah Lemak Jenuh / Statin)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-teal-300">
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
              className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline ({totalCholesterol} mg/dL)</span>
              <span>-40 mg/dL</span>
              <span>-80 mg/dL (Target Optimal)</span>
            </div>
          </div>

          {/* 4. HDL Cholesterol Elevation Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Flame className="h-4 w-4 text-emerald-400" />
                <span>Peningkatan HDL Kolesterol (Olahraga Aerobik Teratur)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-300">
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
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline ({hdlCholesterol} mg/dL)</span>
              <span>+10 mg/dL</span>
              <span>+25 mg/dL (Protektif Tinggi)</span>
            </div>
          </div>

        </div>

        {/* Right: Outcome Impact Display (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
          
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              Proyeksi Dampak Penurunan Risiko (10-Yr CVD):
            </span>

            {/* Before vs After Score Card */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              
              {/* Baseline */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">KONDISI SAAT INI</span>
                <div className="text-2xl font-extrabold font-mono text-slate-100">
                  {baselineFramingham.riskPercent10Yr}%
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Tier {baselineWho.riskTier} (WHO)
                </div>
              </div>

              {/* Simulated */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                simFramingham.riskPercent10Yr < baselineFramingham.riskPercent10Yr
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-900/90 border-slate-800'
              }`}>
                <span className="text-[10px] text-emerald-400 block font-semibold">HASIL SIMULASI</span>
                <div className="text-2xl font-extrabold font-mono text-emerald-400">
                  {simFramingham.riskPercent10Yr}%
                </div>
                <div className="text-[10px] text-emerald-300 font-medium">
                  Tier {simWho.riskTier} (WHO)
                </div>
              </div>

            </div>

            {/* Benefit Badges */}
            {absoluteReduction > 0 ? (
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <TrendingDown className="h-4 w-4" />
                  <span>Potensi Keuntungan Klinis Nyata (ARR & RRR):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div className="bg-emerald-900/20 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block">Absolute Risk Reduction</span>
                    <span className="text-base font-bold font-mono text-emerald-300">-{absoluteReduction}%</span>
                  </div>
                  <div className="bg-emerald-900/20 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block">Relative Risk Reduction</span>
                    <span className="text-base font-bold font-mono text-emerald-300">-{relativeReduction}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  Dengan mengoptimalkan faktor risiko yang dapat dimodifikasi (termasuk kepatuhan obat dan berhenti merokok), pekerja berpotensi menurunkan risiko kardiovaskular hingga <strong>{relativeReduction}%</strong> dibandingkan baseline saat ini.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Geser slider atau ubah status merokok di sebelah kiri untuk melihat proyeksi penurunan risiko.</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Rekomendasi Dokumen K3</span>
            <span className="text-sky-400 font-medium">Baku EBM & KKI</span>
          </div>

        </div>

      </div>

    </div>
  );
}
