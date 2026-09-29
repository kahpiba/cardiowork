'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  ShieldCheck
} from 'lucide-react';
import { ShapExplanationResult } from '@/lib/shap/shapExplainer';

interface ShapWaterfallChartProps {
  data: ShapExplanationResult;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'layman' | 'clinical'>('layman');
  const [activeCategory, setActiveCategory] = useState<'all' | 'modifiable' | 'non_modifiable'>('all');

  const basePercent = data.baseValue * 100;
  const finalPercent = data.predictedProbability * 100;
  const maxAbsPhi = Math.max(...data.contributions.map(c => Math.abs(c.phiValue * 100)), 10);

  // Classify features into Modifiable vs Non-Modifiable
  const isModifiableFeature = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('sbp') || 
           lower.includes('tensi') || 
           lower.includes('smok') || 
           lower.includes('rokok') || 
           lower.includes('chol') || 
           lower.includes('ldl') || 
           lower.includes('sleep') || 
           lower.includes('tidur') || 
           lower.includes('bmi') || 
           lower.includes('imt');
  };

  const filteredContributions = data.contributions.filter(item => {
    if (activeCategory === 'modifiable') return isModifiableFeature(item.featureName);
    if (activeCategory === 'non_modifiable') return !isModifiableFeature(item.featureName);
    return true;
  });

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Faktor Utama Penggerak Risiko (SHAP Explainable AI)
            </h3>
            <span className="text-xs font-mono bg-rose-50 text-rose-900 px-3 py-0.5 rounded-full border border-rose-200 font-bold">
              TreeSHAP Terkalibrasi
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Membongkar faktor individual yang menggeser risiko pekerja dari baseline populasi rata-rata ke probabilitas akhir.
          </p>
        </div>

        {/* View Mode & Baseline Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center shadow-2xs">
            <span className="text-stone-500 block text-xs uppercase font-bold">Baseline E[f(x)]</span>
            <strong className="text-stone-800 text-sm tabular-nums">{basePercent.toFixed(1)}%</strong>
          </div>
          <div className="text-stone-400 font-bold text-base">&rarr;</div>
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center shadow-2xs">
            <span className="text-stone-500 block text-xs uppercase font-bold">Prediksi Akhir</span>
            <strong className={`tabular-nums text-sm ${finalPercent >= 30 ? 'text-rose-700' : finalPercent >= 15 ? 'text-amber-800' : 'text-emerald-800'}`}>
              {finalPercent.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs: Modifiable vs Non-Modifiable */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeCategory === 'all' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua Faktor ({data.contributions.length})
          </button>
          <button
            onClick={() => setActiveCategory('modifiable')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
              activeCategory === 'modifiable' ? 'bg-white text-rose-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Dapat Diubah (Gaya Hidup/Obat)</span>
          </button>
          <button
            onClick={() => setActiveCategory('non_modifiable')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
              activeCategory === 'non_modifiable' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            <span>Faktor Bawaan (Usia/Genetik)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
          <span>Tampilan:</span>
          <button
            onClick={() => setViewMode(viewMode === 'layman' ? 'clinical' : 'layman')}
            className="font-bold text-rose-800 hover:text-rose-900 underline transition"
          >
            {viewMode === 'layman' ? 'Mode Awam (Persentase)' : 'Mode Klinis (SHAP Value Log-Odds)'}
          </button>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="space-y-3.5" role="list">
        {filteredContributions.map((item) => {
          const phiPercent = item.phiValue * 100;
          const isPositive = phiPercent > 0;
          const barWidthPercent = Math.min(100, (Math.abs(phiPercent) / maxAbsPhi) * 100);
          const isModifiable = isModifiableFeature(item.featureName);

          return (
            <div 
              key={item.featureName}
              role="listitem"
              className="group p-4 sm:p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                
                {/* Feature Label and Value */}
                <div className="space-y-1.5 sm:w-2/5">
                  <div className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-amber-800 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                    <span>{item.displayName}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                      isModifiable 
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {isModifiable ? 'Modifiable' : 'Fixed'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-mono pl-6">
                    Nilai: <strong className="text-stone-900 font-bold">{item.workerValue}</strong> (Standar Normal: {item.referenceBaseline})
                  </div>
                </div>

                {/* Contribution Bar */}
                <div className="sm:w-1/2 flex items-center gap-3">
                  <div className="flex-1 bg-stone-200 h-3.5 rounded-full overflow-hidden flex items-center relative">
                    {/* Center baseline divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-400 z-10" />

                    {isPositive ? (
                      // Right of center (Increases Risk)
                      <div className="w-1/2 flex justify-start pl-[50%]">
                        <div 
                          className="h-full bg-amber-700 rounded-r-full transition-all duration-500 shadow-2xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    ) : (
                      // Left of center (Protective effect)
                      <div className="w-1/2 flex justify-end pr-0">
                        <div 
                          className="h-full bg-emerald-600 rounded-l-full transition-all duration-500 shadow-2xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span className={`w-24 text-right font-mono font-bold text-xs sm:text-sm tabular-nums ${
                    isPositive ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {viewMode === 'layman' 
                      ? (isPositive ? `+${phiPercent.toFixed(1)}%` : `${phiPercent.toFixed(1)}%`)
                      : (isPositive ? `+${item.phiValue.toFixed(3)}` : item.phiValue.toFixed(3))}
                  </span>
                </div>

              </div>

              {/* Educational Guidance */}
              <div className="mt-3 pt-2.5 border-t border-stone-200/80 text-xs sm:text-sm text-stone-700 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{item.clinicalExplanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Narrative Box */}
      <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 sm:p-5 text-sm text-stone-800 leading-relaxed space-y-2 shadow-2xs">
        <div className="font-bold text-rose-950 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-700" />
          <span>Kesimpulan Transparansi Klinis AI (Clinical Decision Support):</span>
        </div>
        <p className="text-stone-700 leading-relaxed">{data.clinicalNarrative}</p>
      </div>

    </div>
  );
};

