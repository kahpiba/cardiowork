'use client';

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DailyAlert } from '@/lib/alerts/alertEngine';

interface DailyAlertBannerProps {
  alerts: DailyAlert[];
}

export const DailyAlertBanner: React.FC<DailyAlertBannerProps> = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-sm text-emerald-800">
            <strong className="text-emerald-950 font-bold">Tidak Ada Peringatan Akut:</strong> Seluruh parameter pemantauan harian pre-shift dan rekaman MCU berada dalam rentang toleransi klinis aman.
          </span>
        </div>
        <span className="text-xs font-mono bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-1 rounded-full text-emerald-800 font-bold tracking-wide">
          HEMODYNAMIC STABLE
        </span>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const bgStyle = criticalCount > 0 
    ? 'bg-rose-50/90 border-rose-200' 
    : 'bg-amber-50/90 border-amber-200';

  return (
    <div className={`border rounded-xl shadow-sm transition-all overflow-hidden ${bgStyle}`}>
      {/* Header bar */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">
                Early Warning System: {alerts.length} Peringatan Aktif Terdeteksi
              </h3>
              {criticalCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {criticalCount} KRITIS
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {warningCount} WASPADA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Tindakan pencegahan dini diperlukan sebelum izin kerja lapangan (permit-to-work) diterbitkan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
        >
          {isExpanded ? (
            <>Sembunyikan <ChevronUp className="w-4 h-4 text-slate-500" /></>
          ) : (
            <>Lihat Rincian <ChevronDown className="w-4 h-4 text-slate-500" /></>
          )}
        </button>
      </div>

      {/* Expanded list of alerts */}
      {isExpanded && (
        <div className="border-t border-slate-200/80 p-4 space-y-3 bg-white/60">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const itemBg = isCrit ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200';
            const badgeBg = isCrit ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200';

            return (
              <div key={alert.id} className={`p-3.5 rounded-lg border text-sm shadow-2xs ${itemBg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCrit ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{alert.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${badgeBg}`}>
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          Parameter: <strong className="text-slate-900">{alert.triggerValues.metric}</strong> ({alert.triggerValues.currentValue})
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">
                          Batas Normal: {alert.triggerValues.threshold}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-xs ${
                    alert.fitVerdictImpact === 'UNFIT' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}>
                    {alert.fitVerdictImpact === 'UNFIT' ? 'IMPAK: UNFIT' : 'IMPAK: RESTRICTED'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <strong className="text-amber-800 font-bold">Rekomendasi K3:</strong> {alert.recommendedAction}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
