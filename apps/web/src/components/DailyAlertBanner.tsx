'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldAlert, 
  Stethoscope,
  Clock,
  Printer
} from 'lucide-react';
import { DailyAlert } from '@/lib/alerts/alertEngine';

interface DailyAlertBannerProps {
  alerts: DailyAlert[];
}

export const DailyAlertBanner: React.FC<DailyAlertBannerProps> = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!alerts || alerts.length === 0) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 shadow-2xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <span>Status Hemodinamik Stabil: Tidak Ada Peringatan Akut</span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Seluruh parameter pemantauan harian pre-shift dan rekaman MCU berada dalam batas toleransi keselamatan kerja normal.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-white text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold tracking-wide self-start sm:self-auto shrink-0 shadow-2xs">
          FIT TO WORK
        </span>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const isCritical = criticalCount > 0;
  const bgStyle = isCritical 
    ? 'bg-rose-50/90 border-rose-300' 
    : 'bg-amber-50/90 border-amber-300';

  return (
    <div 
      role={isCritical ? 'alert' : 'status'}
      aria-live={isCritical ? 'assertive' : 'polite'}
      className={`border rounded-2xl shadow-sm transition-all overflow-hidden ${bgStyle}`}
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {isCritical ? (
            <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                Early Warning System: {alerts.length} Indikasi Anomali Pre-Shift
              </h3>
              {criticalCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {criticalCount} KRITIS
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {warningCount} WASPADA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Pemberitahuan keselamatan K3: Diperlukan tindakan pencegahan klinis sebelum izin kerja (permit-to-work) diterbitkan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {isExpanded ? (
              <>Sembunyikan SOP <ChevronUp className="w-4 h-4 text-slate-500" /></>
            ) : (
              <>Lihat Rincian SOP ({alerts.length}) <ChevronDown className="w-4 h-4 text-slate-500" /></>
            )}
          </button>
        </div>
      </div>

      {/* Expanded list of alerts */}
      {isExpanded && (
        <div className="border-t border-slate-200/80 p-4 sm:p-5 space-y-3.5 bg-white/70">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const itemBg = isCrit ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200';
            const badgeBg = isCrit ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200';

            return (
              <div key={alert.id} className={`p-4 rounded-xl border text-sm shadow-2xs transition-all ${itemBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {isCrit ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{alert.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${badgeBg}`}>
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 shadow-2xs">
                          Parameter: <strong className="text-slate-900 font-bold">{alert.triggerValues.metric}</strong> ({alert.triggerValues.currentValue})
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500 shadow-2xs">
                          Batas Aman: {alert.triggerValues.threshold}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-3 py-1 rounded-full shrink-0 shadow-2xs self-start ${
                    alert.fitVerdictImpact === 'UNFIT' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}>
                    {alert.fitVerdictImpact === 'UNFIT' ? 'STATUS: UNFIT' : 'STATUS: RESTRIKSI'}
                  </span>
                </div>

                {/* SOP Action Protocol */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <strong className="text-amber-900 font-bold flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                      Protokol SOP K3:
                    </strong>
                    <span>{alert.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => typeof window !== 'undefined' && window.alert(`Protokol istirahat 15 menit & ukur ulang diaktifkan untuk pekerja.`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs"
                    >
                      Istirahat 15 Mnt
                    </button>
                    {isCrit && (
                      <button
                        onClick={() => typeof window !== 'undefined' && window.alert(`Protokol Tunda Shift & Eskalasi Klinik diaktifkan.`)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                      >
                        Tunda Shift
                      </button>
                    )}
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
