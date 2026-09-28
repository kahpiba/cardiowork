'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import { ShapExplanationResult } from '@/lib/shap/shapExplainer';

interface ShapWaterfallChartProps {
  data: ShapExplanationResult;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({ data }) => {
  const basePercent = data.baseValue * 100;
  const finalPercent = data.predictedProbability * 100;
  const maxAbsPhi = Math.max(...data.contributions.map(c => Math.abs(c.phiValue * 100)), 10);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              SHAP Waterfall Plot: Atribusi Kontribusi Variabel Risiko
            </h3>
            <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200 font-bold">
              Local Explainable AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Menjelaskan bagaimana fitur individual pekerja menggeser prediksi risiko dari baseline populasi (E[f(x)]) ke probabilitas akhir.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Base E[f(x)]</span>
            <strong className="text-slate-700">{basePercent.toFixed(1)}%</strong>
          </div>
          <div className="text-slate-400 font-bold">&rarr;</div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Prediksi Akhir</span>
            <strong className={finalPercent >= 35 ? 'text-rose-600' : finalPercent >= 15 ? 'text-amber-600' : 'text-emerald-600'}>
              {finalPercent.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="space-y-3">
        {data.contributions.map((item) => {
          const phiPercent = item.phiValue * 100;
          const isPositive = phiPercent > 0;
          const barWidthPercent = Math.min(100, (Math.abs(phiPercent) / maxAbsPhi) * 100);

          return (
            <div 
              key={item.featureName}
              className="group p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                
                {/* Feature Label and Value */}
                <div className="space-y-0.5 sm:w-1/3">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{item.displayName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono pl-5.5">
                    Nilai: <strong className="text-slate-700 font-bold">{item.workerValue}</strong> (Ref: {item.referenceBaseline})
                  </div>
                </div>

                {/* Contribution Bar */}
                <div className="sm:w-1/2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden flex items-center relative">
                    {/* Center baseline divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />

                    {isPositive ? (
                      // Right of center (Risk increment)
                      <div className="w-1/2 flex justify-start pl-[50%]">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full transition-all duration-500 shadow-xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    ) : (
                      // Left of center (Protective effect)
                      <div className="w-1/2 flex justify-end pr-0">
                        <div 
                          className="h-full bg-gradient-to-l from-emerald-500 to-teal-500 rounded-l-full transition-all duration-500 shadow-xs"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span className={`w-16 text-right font-mono font-bold text-xs ${
                    isPositive ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {isPositive ? `+${phiPercent.toFixed(1)}%` : `${phiPercent.toFixed(1)}%`}
                  </span>
                </div>

              </div>

              {/* Clinical Explanation tooltip/subtext */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{item.clinicalExplanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Narrative Box */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1.5">
        <div className="font-bold text-sky-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          Kesimpulan Transparansi Klinis (Doctor Decision Support):
        </div>
        <p className="text-slate-600">{data.clinicalNarrative}</p>
      </div>

    </div>
  );
};
