'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              Faktor Utama Penggerak Risiko (SHAP Explainable AI)
            </h3>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 font-bold">
              TreeSHAP Terkalibrasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Membongkar faktor individual yang menggeser risiko pekerja dari baseline populasi rata-rata ke probabilitas akhir.
          </p>
        </div>

        {/* View Mode & Baseline Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Baseline Populasi E[f(x)]</span>
            <strong className="text-slate-700 tabular-nums">{basePercent.toFixed(1)}%</strong>
          </div>
          <div className="text-slate-400 font-bold">&rarr;</div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Prediksi Akhir</span>
            <strong className={`tabular-nums ${finalPercent >= 30 ? 'text-rose-600' : finalPercent >= 15 ? 'text-amber-600' : 'text-teal-700'}`}>
              {finalPercent.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs: Modifiable vs Non-Modifiable */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Faktor ({data.contributions.length})
          </button>
          <button
            onClick={() => setActiveCategory('modifiable')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeCategory === 'modifiable' ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Dapat Diubah (Gaya Hidup/Obat)</span>
          </button>
          <button
            onClick={() => setActiveCategory('non_modifiable')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeCategory === 'non_modifiable' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Faktor Bawaan (Usia/Genetik)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Tampilan:</span>
          <button
            onClick={() => setViewMode(viewMode === 'layman' ? 'clinical' : 'layman')}
            className="font-bold text-teal-700 hover:text-teal-800 underline transition"
          >
            {viewMode === 'layman' ? 'Mode Awam (Persentase)' : 'Mode Klinis (SHAP Value Log-Odds)'}
          </button>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="space-y-3" role="list">
        {filteredContributions.map((item, idx) => {
          const phiPercent = item.phiValue * 100;
          const isPositive = phiPercent > 0;
          const barWidthPercent = Math.min(100, (Math.abs(phiPercent) / maxAbsPhi) * 100);
          const isModifiable = isModifiableFeature(item.featureName);

          return (
            <div 
              key={item.featureName}
              role="listitem"
              className="group p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                {/* Feature Label and Value */}
                <div className="space-y-1 sm:w-2/5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-orange-600 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    <span>{item.displayName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                      isModifiable 
                        ? 'bg-teal-50 text-teal-800 border-teal-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {isModifiable ? 'Modifiable' : 'Fixed'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono pl-5.5">
                    Nilai: <strong className="text-slate-800 font-bold">{item.workerValue}</strong> (Standar Normal: {item.referenceBaseline})
                  </div>
                </div>

                {/* Contribution Bar */}
                <div className="sm:w-1/2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden flex items-center relative">
                    {/* Center baseline divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />

                    {isPositive ? (
                      // Right of center (Increases Risk)
                      <div className="w-1/2 flex justify-start pl-[50%]">
                        <div 
                          className="h-full bg-orange-600 rounded-r-full transition-all duration-500 shadow-2xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    ) : (
                      // Left of center (Protective effect)
                      <div className="w-1/2 flex justify-end pr-0">
                        <div 
                          className="h-full bg-teal-600 rounded-l-full transition-all duration-500 shadow-2xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span className={`w-20 text-right font-mono font-bold text-xs tabular-nums ${
                    isPositive ? 'text-orange-700' : 'text-teal-700'
                  }`}>
                    {viewMode === 'layman' 
                      ? (isPositive ? `+${phiPercent.toFixed(1)}%` : `${phiPercent.toFixed(1)}%`)
                      : (isPositive ? `+${item.phiValue.toFixed(3)}` : item.phiValue.toFixed(3))}
                  </span>
                </div>

              </div>

              {/* Educational Guidance */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{item.clinicalExplanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Narrative Box */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1.5 shadow-2xs">
        <div className="font-bold text-teal-950 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Kesimpulan Transparansi Klinis AI (Clinical Decision Support):</span>
        </div>
        <p className="text-slate-700">{data.clinicalNarrative}</p>
      </div>

    </div>
  );
};
