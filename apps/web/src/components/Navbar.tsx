'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Bell, Shield, User, Terminal, FileSpreadsheet, AlertCircle, X, Users, Cpu, UploadCloud } from 'lucide-react';
import { DailyAlert } from '@/lib/alerts/alertEngine';
import { RolePersonaSwitcher } from './RolePersonaSwitcher';

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
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white animate-heartbeat" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-stone-900">
                    Cardio<span className="text-teal-700">Work</span>
                  </span>
                  <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                    CDSS AI
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium hidden sm:block">
                  Occupational Health & Risk Prediction
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl border border-stone-200">
            <Link
              href="/workers"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/worker')
                  ? 'bg-white text-teal-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-500" />
              Direktori Pekerja
            </Link>

            <Link
              href="/kiosk"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/kiosk')
                  ? 'bg-white text-teal-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-stone-500" />
              DCU Kiosk
            </Link>

            <Link
              href="/population"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/population')
                  ? 'bg-white text-teal-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-stone-500" />
              Populasi K3
            </Link>

            <Link
              href="/upload"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/upload')
                  ? 'bg-white text-teal-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-stone-500" />
              Unggah Data
            </Link>

            <Link
              href="/model-lab"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith('/model-lab')
                  ? 'bg-white text-teal-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-stone-500" />
              Model Lab
            </Link>
          </nav>

          {/* Right Actions: Alert Bell + Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Alert Bell Button */}
            <button
              onClick={() => setIsAlertOpen(true)}
              className="relative p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-all shadow-2xs"
              title="Pusat Peringatan Dini Harian"
            >
              <Bell className="w-4 h-4" />
              {criticalCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-700 text-xs font-bold text-white animate-pulse">
                  {criticalCount}
                </span>
              ) : warningCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                  {warningCount}
                </span>
              ) : null}
            </button>

            {/* Persona Switcher Component */}
            <div className="pl-2 border-l border-stone-200">
              <RolePersonaSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Alert Drawer / Modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Pusat Peringatan Dini Kesehatan Kerja (Live EWS)
                  </h3>
                  <p className="text-xs text-stone-500">Pemantauan tanda vital sebelum shift kerja</p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-stone-50/50">
              <div className="flex items-center justify-between text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span>Total Peringatan Aktif: <strong className="text-stone-900">{alerts.length}</strong></span>
                <span className="flex items-center gap-3">
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span> {criticalCount} Kritis
                  </span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> {warningCount} Waspada
                  </span>
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-sm">
                  Tidak ada peringatan aktif saat ini. Semua pekerja dalam kondisi hemodinamik stabil.
                </div>
              ) : (
                alerts.map((alert) => {
                  const isCrit = alert.severity === 'CRITICAL';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border text-sm transition-all shadow-2xs ${
                        isCrit
                          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                          : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isCrit ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="font-bold text-stone-900">{alert.workerName} ({alert.workerId})</span>
                        </div>
                        <span className="text-xs text-stone-600 font-mono bg-white/80 px-2 py-0.5 rounded border border-stone-200">{alert.department}</span>
                      </div>
                      <div className="text-xs font-bold text-stone-900 mt-1">{alert.title}</div>
                      <p className="text-xs text-stone-700 mt-1">{alert.description}</p>
                      <div className="mt-2.5 text-xs bg-white p-2.5 rounded-lg border border-stone-200 text-stone-800">
                        <strong className="text-stone-900">Tindakan K3 Direkomendasikan:</strong> {alert.recommendedAction}
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/worker/${alert.workerId}`}
                          onClick={() => setIsAlertOpen(false)}
                          className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline underline-offset-2 flex items-center gap-1"
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
            <div className="p-3.5 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
              <span>Diperbarui otomatis tiap 60 detik dari data Kiosk & MCU</span>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold border border-stone-200 transition"
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
