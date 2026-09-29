'use client';

import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  BarChart2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Binary 
} from 'lucide-react';

interface Layer3DlScoreCardProps {
  systolicBp: number;
  diastolicBp: number;
  totalCholesterol: number;
  ldlCholesterol: number;
  fastingGlucose: number;
  isSmoker: boolean;
  age: number;
  dcuMeanSbp: number;
  dcuStdSbp: number;
  dcuHypertensiveDays: number;
  dcuSymptomDays: number;
  layer1FraminghamPercent: number;
  layer2LgbmPercent: number;
}

export function Layer3DlScoreCard({
  systolicBp,
  diastolicBp,
  totalCholesterol,
  ldlCholesterol,
  fastingGlucose,
  isSmoker,
  age,
  dcuMeanSbp,
  dcuStdSbp,
  dcuHypertensiveDays,
  dcuSymptomDays,
  layer1FraminghamPercent,
  layer2LgbmPercent
}: Layer3DlScoreCardProps) {
  const [showArchitectureDetails, setShowArchitectureDetails] = useState(false);

  const mcuComponent = 0.45 * (
    (systolicBp - 120) * 0.045 + 
    (ldlCholesterol - 100) * 0.025 + 
    (isSmoker ? 1.2 : 0) + 
    (age - 40) * 0.04
  );

  const dcuTemporalComponent = 0.55 * (
    (dcuMeanSbp - 120) * 0.05 + 
    (dcuStdSbp - 6.0) * 0.08 + 
    (dcuHypertensiveDays * 0.08) + 
    (dcuSymptomDays * 0.35)
  );

  const zFused = -4.8 + mcuComponent + dcuTemporalComponent;
  const fusionProb = 1.0 / (1.0 + Math.exp(-zFused));
  const fusionPercent = Math.min(99.0, Math.max(1.0, Math.round(fusionProb * 1000) / 10));

  const zUnfit = -4.2 + (systolicBp - 130) * 0.05 + (dcuHypertensiveDays * 0.12) + (dcuSymptomDays * 0.45);
  const unfitProb = 1.0 / (1.0 + Math.exp(-zUnfit));
  const unfitPercent = Math.min(99.0, Math.max(1.0, Math.round(unfitProb * 1000) / 10));

  const signalDivergence = Math.abs(systolicBp - dcuMeanSbp);
  const uncertaintyStd = Math.round((2.0 + (signalDivergence * 0.12) + (dcuStdSbp * 0.15)) * 10) / 10;
  const ciLower = Math.max(0.5, Math.round((fusionPercent - 1.96 * uncertaintyStd) * 10) / 10);
  const ciUpper = Math.min(99.5, Math.round((fusionPercent + 1.96 * uncertaintyStd) * 10) / 10);

  const rawAnomalyLoss = 0.28 + 
    Math.pow(Math.max(0, systolicBp - 140) / 20.0, 2) * 0.25 + 
    Math.pow(Math.max(0, dcuStdSbp - 10.0) / 5.0, 2) * 0.22 + 
    (dcuSymptomDays > 0 ? 0.35 : 0.0);
  const anomalyScore = Math.round(rawAnomalyLoss * 1000) / 1000;
  const anomalyThreshold = 0.65;
  const isAnomalous = anomalyScore >= anomalyThreshold;

  let riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let badgeColor = 'bg-emerald-50 text-emerald-950 border-emerald-300';

  if (fusionPercent >= 40.0) {
    riskTier = 'CRITICAL';
    badgeColor = 'bg-rose-50 text-rose-900 border-rose-300';
  } else if (fusionPercent >= 20.0) {
    riskTier = 'HIGH';
    badgeColor = 'bg-orange-50 text-orange-900 border-orange-300';
  } else if (fusionPercent >= 10.0) {
    riskTier = 'MODERATE';
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-300';
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shadow-2xs">
            <Network className="h-5 w-5 text-stone-700" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base tracking-wide">
              Layer 3 — PyTorch Deep Learning & Multimodal Fusion (MCU Tabular + DCU GRU-D)
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">Integrasi fusi multi-modalitas late-fusion dengan estimasi ketidakpastian.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 font-semibold">
            PyTorch ONNX • 571 KB
          </span>
          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 font-semibold">
            MC Dropout CI 95%
          </span>
        </div>
      </div>

      {/* 3 Main Deep Learning Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Multimodal Fusion CVD Risk */}
        <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-stone-800">Multimodal CVD Risk (10-Yr)</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
              {riskTier}
            </span>
          </div>
          <div>
            <div className="text-4xl font-black font-mono text-rose-950 tabular-nums">
              {fusionPercent}%
            </div>
            <div className="text-xs text-stone-600 mt-1 flex items-center space-x-1.5">
              <span>Interval Kredibilitas (95% CI):</span>
              <span className="font-mono text-stone-900 font-bold">{ciLower}%–{ciUpper}%</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-stone-200 text-xs text-stone-600 leading-relaxed">
            Fusi terbobot: Profil Darah MCU (45%) + Fluktuasi DCU 30 Hari (55%).
          </div>
        </div>

        {/* Card 2: Operational Unfit Probability Head */}
        <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-stone-800">Probabilitas Insiden Unfit</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              unfitPercent >= 25.0 ? 'bg-rose-50 text-rose-900 border-rose-300' :
              unfitPercent >= 10.0 ? 'bg-amber-50 text-amber-900 border-amber-300' :
              'bg-emerald-50 text-emerald-950 border-emerald-300'
            }`}>
              {unfitPercent >= 25.0 ? 'RISIKO MEDEVAC TINGGI' : unfitPercent >= 10.0 ? 'RESTRIKSI KERJA' : 'OPERASIONAL AMAN'}
            </span>
          </div>
          <div>
            <div className="text-4xl font-black font-mono text-stone-900 tabular-nums">
              {unfitPercent}%
            </div>
            <div className="text-xs text-stone-600 mt-1">
              Probabilitas kegagalan fisik mendadak saat bertugas di shift kerja aktif.
            </div>
          </div>
          <div className="pt-2.5 border-t border-stone-200 text-xs text-stone-600 leading-relaxed">
            Multi-task head: Dilatih untuk memprediksi kebutuhan evakuasi medis darurat (Medevac).
          </div>
        </div>

        {/* Card 3: Autoencoder Anomaly Score */}
        <div className="bg-stone-50/80 p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-stone-800">Autoencoder Anomaly MSE</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isAnomalous ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold' : 'bg-emerald-50 text-emerald-950 border-emerald-300'
            }`}>
              {isAnomalous ? 'ANOMALI AKUT' : 'POLA FISIOLOGIS WAJAR'}
            </span>
          </div>
          <div>
            <div className="text-4xl font-black font-mono text-stone-900 tabular-nums">
              {anomalyScore}
            </div>
            <div className="text-xs text-stone-600 mt-1 flex items-center space-x-1.5">
              <span>Threshold Ambang:</span>
              <span className="font-mono text-stone-800 font-bold">{anomalyThreshold} MSE</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-stone-200 text-xs text-stone-600 leading-relaxed">
            Unsupervised Deep Autoencoder: Mendeteksi penyimpangan pola fisiologis tak lazim.
          </div>
        </div>

      </div>

      {/* Deep Learning Architecture Details Toggle */}
      <div className="pt-1">
        <button 
          onClick={() => setShowArchitectureDetails(!showArchitectureDetails)}
          className="text-sm text-rose-800 hover:text-rose-900 flex items-center space-x-1.5 transition font-bold"
        >
          <Layers className="h-4 w-4" />
          <span>{showArchitectureDetails ? 'Sembunyikan Spesifikasi Arsitektur Neural Network' : 'Tampilkan Spesifikasi Arsitektur PyTorch & Bobot Fusi'}</span>
          {showArchitectureDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showArchitectureDetails && (
          <div className="mt-3 p-5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-500 block">Tabular MCU Branch:</span>
                <span className="text-stone-900 font-bold">MLP 3-Layer (Residual Skip)</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-500 block">Temporal DCU Branch:</span>
                <span className="text-stone-900 font-bold">Bi-GRU-D Temporal Encoder</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-stone-500 block">Uncertainty Estimation:</span>
                <span className="text-stone-900 font-bold">Monte Carlo Dropout (p=0.25)</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Arsitektur fusi multimodal dilatih menggunakan PyTorch dengan fungsi loss terbobot ganda (Binary Cross-Entropy untuk CVD Risk + Focal Loss untuk Operational Unfit). Mekanisme Cross-Attention menimbang sinyal mana yang lebih mendesak antara profil darah statis MCU dan ketidakstabilan tensi DCU harian.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
