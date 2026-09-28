'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Bell, Shield, User, Terminal, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { DailyAlert } from '@/lib/alerts/alertEngine';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<DailyAlert[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAlerts() {
      try {
        setLoading(true);
        const res = await fetch('/api/alerts/daily');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAlerts(data.alerts || []);
          }
        }
      } catch (err) {
        // Silently catch in dev
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAlerts();
    // Poll every 60s for new pre-shift alerts
    const interval = setInterval(fetchAlerts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/worker/W-00192" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    CardioWork
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                    CDSS AI
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                  Occupational Health & Risk Prediction
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
            <Link
              href="/worker/W-00192"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/worker')
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Dashboard Pekerja
            </Link>

            <Link
              href="/kiosk"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/kiosk')
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Pre-shift DCU Kiosk
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                Mandiri
              </span>
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Unggah MCU / DCU
            </Link>
          </nav>

          {/* Right Actions: Alert Bell + Profile */}
          <div className="flex items-center gap-3">
            {/* Alert Bell Button */}
            <button
              onClick={() => setIsAlertOpen(true)}
              className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all"
              title="Pusat Peringatan Dini Harian"
            >
              <Bell className="w-4 h-4" />
              {criticalCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white animate-pulse">
                  {criticalCount}
                </span>
              ) : warningCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                  {warningCount}
                </span>
              ) : null}
            </button>

            {/* Role Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-zinc-200">dr. Paramedik K3</div>
                <div className="text-[10px] text-zinc-500">Offshore Site Lead</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Alert Drawer / Modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">
                  Pusat Peringatan Dini Kesehatan Kerja (Live EWS)
                </h3>
              </div>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
                <span>Total Peringatan: <strong className="text-white">{alerts.length}</strong></span>
                <span className="flex items-center gap-3">
                  <span className="text-rose-400">🔴 {criticalCount} Kritis</span>
                  <span className="text-amber-400">🟡 {warningCount} Waspada</span>
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm">
                  Tidak ada peringatan aktif saat ini. Semua kru dalam kondisi hemodinamik stabil.
                </div>
              ) : (
                alerts.map((alert) => {
                  const isCrit = alert.severity === 'CRITICAL';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border text-sm ${
                        isCrit
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCrit ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="font-bold text-white">{alert.workerName} ({alert.workerId})</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">{alert.department}</span>
                      </div>
                      <div className="text-xs font-semibold text-white/90 mt-1">{alert.title}</div>
                      <p className="text-xs opacity-90 mt-1">{alert.description}</p>
                      <div className="mt-2 text-xs bg-black/40 p-2 rounded text-zinc-300">
                        <strong>Tindakan K3:</strong> {alert.recommendedAction}
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/worker/${alert.workerId}`}
                          onClick={() => setIsAlertOpen(false)}
                          className="text-xs font-semibold underline hover:text-white"
                        >
                          Buka Rekam Medis Pekerja &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Diperbarui otomatis tiap 60 detik dari data Kiosk & MCU</span>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
