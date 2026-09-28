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
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-emerald-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm">
            <strong>Tidak Ada Peringatan Akut:</strong> Seluruh parameter pemantauan harian pre-shift dan rekaman MCU berada dalam rentang toleransi klinis aman.
          </span>
        </div>
        <span className="text-xs font-mono bg-emerald-500/20 px-2.5 py-1 rounded text-emerald-300">
          HEMODYNAMIC STABLE
        </span>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const bgStyle = criticalCount > 0 
    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
    : 'bg-amber-950/40 border-amber-500/50 text-amber-200';

  return (
    <div className={`border rounded-xl shadow-lg transition-all ${bgStyle}`}>
      {/* Header bar */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-white">
                Early Warning System: {alerts.length} Peringatan Aktif Terdeteksi
              </h3>
              {criticalCount > 0 && (
                <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {criticalCount} KRITIS
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {warningCount} WASPADA
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Tindakan pencegahan dini diperlukan sebelum izin kerja lapangan (permit-to-work) diterbitkan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0"
        >
          {isExpanded ? (
            <>Sembunyikan <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Lihat Rincian <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Expanded list of alerts */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-3 bg-black/20">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const itemBg = isCrit ? 'bg-rose-900/30 border-rose-500/30' : 'bg-amber-900/30 border-amber-500/30';
            const badgeBg = isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300';

            return (
              <div key={alert.id} className={`p-3.5 rounded-lg border text-sm ${itemBg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCrit ? (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{alert.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${badgeBg}`}>
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="bg-black/30 px-2 py-1 rounded font-mono">
                          Parameter: <strong className="text-white">{alert.triggerValues.metric}</strong> ({alert.triggerValues.currentValue})
                        </span>
                        <span className="bg-black/30 px-2 py-1 rounded font-mono text-zinc-400">
                          Batas Normal: {alert.triggerValues.threshold}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded shrink-0 ${
                    alert.fitVerdictImpact === 'UNFIT' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}>
                    {alert.fitVerdictImpact === 'UNFIT' ? 'IMPAK: UNFIT' : 'IMPAK: RESTRICTED'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <strong className="text-amber-300">Rekomendasi K3:</strong> {alert.recommendedAction}
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
