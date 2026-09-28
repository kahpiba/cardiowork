'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { ShapExplanationResult } from '@/lib/shap/shapExplainer';

interface ShapWaterfallChartProps {
  data: ShapExplanationResult;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({ data }) => {
  const basePercent = data.baseValue * 100;
  const finalPercent = data.predictedProbability * 100;
  const maxAbsPhi = Math.max(...data.contributions.map(c => Math.abs(c.phiValue * 100)), 10);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              SHAP Waterfall Plot: Atribusi Kontribusi Variabel Risiko
            </h3>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
              Local Explainable AI
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Menjelaskan bagaimana fitur individual mengubah prediksi risiko dari baseline populasi menuju probabilitas akhir pekerja.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">Base Value E[f(x)]</span>
            <strong className="text-zinc-300">{basePercent.toFixed(1)}%</strong>
          </div>
          <div className="text-zinc-500">&rarr;</div>
          <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">Prediksi f(x)</span>
            <strong className={finalPercent >= 35 ? 'text-rose-400' : finalPercent >= 15 ? 'text-amber-400' : 'text-emerald-400'}>
              {finalPercent.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="space-y-3">
        {data.contributions.map((item, index) => {
          const phiPercent = item.phiValue * 100;
          const isPositive = phiPercent > 0;
          const barWidthPercent = Math.min(100, (Math.abs(phiPercent) / maxAbsPhi) * 100);

          return (
            <div 
              key={item.featureName}
              className="group p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                
                {/* Feature Label and Value */}
                <div className="space-y-0.5 sm:w-1/3">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{item.displayName}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono pl-5.5">
                    Nilai: <strong className="text-zinc-200">{item.workerValue}</strong> (Ref: {item.referenceBaseline})
                  </div>
                </div>

                {/* Contribution Bar */}
                <div className="sm:w-1/2 flex items-center gap-3">
                  <div className="flex-1 bg-zinc-900 h-3 rounded-full overflow-hidden flex items-center relative">
                    {/* Center baseline divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-700 z-10" />

                    {isPositive ? (
                      // Right of center
                      <div className="w-1/2 flex justify-start pl-[50%]">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-r-full transition-all duration-500"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    ) : (
                      // Left of center
                      <div className="w-1/2 flex justify-end pr-0">
                        <div 
                          className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                          style={{ width: `${barWidthPercent / 2}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span className={`w-16 text-right font-mono font-bold text-xs ${
                    isPositive ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {isPositive ? `+${phiPercent.toFixed(1)}%` : `${phiPercent.toFixed(1)}%`}
                  </span>
                </div>

              </div>

              {/* Clinical Explanation tooltip/subtext */}
              <div className="mt-2 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>{item.clinicalExplanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Narrative Box */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed space-y-1.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          Kesimpulan Transparansi Klinis (Doctor Decision Support):
        </div>
        <p>{data.clinicalNarrative}</p>
      </div>

    </div>
  );
};
