'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Heart, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  HardHat,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface EnrichedWorker {
  id: string;
  pseudonymId: string;
  nameSynthetic: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  department: string;
  jobTitle: string;
  jobHazardCategory: string;
  shiftPattern: string;
  tenureMonths: number;
  isActive: boolean;
  mcuCount: number;
  latestMcuDate: string | null;
  latestBp: string | null;
  latestFitness: string;
  latestDcuVerdict: string;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export default function WorkersRosterPage() {
  const [workers, setWorkers] = useState<EnrichedWorker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  useEffect(() => {
    async function loadWorkers() {
      try {
        setLoading(true);
        const res = await fetch('/api/workers');
        if (res.ok) {
          const data = await res.json();
          setWorkers(data.workers || []);
        }
      } catch (err) {
        console.error('Failed to load workers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkers();
  }, []);

  const departments = ['ALL', ...Array.from(new Set(workers.map(w => w.department)))];

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      w.pseudonymId.toLowerCase().includes(search.toLowerCase()) ||
      w.nameSynthetic.toLowerCase().includes(search.toLowerCase()) ||
      w.jobTitle.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || w.department === selectedDept;
    const matchesRisk = selectedRisk === 'ALL' || w.riskTier === selectedRisk;

    return matchesSearch && matchesDept && matchesRisk;
  });

  const criticalCount = workers.filter(w => w.riskTier === 'CRITICAL' || w.latestDcuVerdict === 'UNFIT').length;
  const highCount = workers.filter(w => w.riskTier === 'HIGH').length;
  const fitCount = workers.filter(w => w.latestFitness === 'FIT' && w.latestDcuVerdict === 'FIT').length;

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Kritis</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">Tinggi</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Moderat</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Rendah</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-rose-600" />
            <span>Roster & Direktori Kesehatan Pekerja Terintegrasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Direktori Pemantauan Pekerja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Daftar kohor pekerja ter-pseudonimkan dengan status kelayakan MCU tahunan dan hasil skrining harian DCU terkini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Unggah Data MCU/DCU</span>
          </Link>
          <Link
            href="/kiosk"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Kios Mandiri DCU</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Pekerja Aktif</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {workers.length}
          </div>
          <p className="text-[11px] text-slate-400">Terdaftar di sistem K3</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Bugar Penuh (Fit)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 font-mono">
            {fitCount}
          </div>
          <p className="text-[11px] text-emerald-700">Layak bekerja tanpa batasan</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Perhatian / Risiko Tinggi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {highCount}
          </div>
          <p className="text-[11px] text-amber-700">Wajib pemantauan DCU rutin</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Kritis / Rekomendasi Unfit</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 font-mono">
            {criticalCount}
          </div>
          <p className="text-[11px] text-rose-700">Tunda shift kerja lapangan</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NIP, nama pekerja, atau jabatan..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            Departemen:
          </span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'Semua Departemen' : d}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Heart className="w-3.5 h-3.5" />
            Risiko:
          </span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="CRITICAL">Kritis (&gt;=160/100 mmHg)</option>
            <option value="HIGH">Tinggi (140-159 mmHg)</option>
            <option value="MODERATE">Moderat</option>
            <option value="LOW">Rendah (&lt;120/80 mmHg)</option>
          </select>
        </div>
      </div>

      {/* Workers Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
          <p className="text-xs font-medium">Memuat data kohor pekerja...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Tidak ada pekerja yang sesuai kriteria pencarian</p>
          <p className="text-xs text-slate-400">Silakan ubah kata kunci atau reset filter departemen/risiko.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => {
            const isCritical = w.riskTier === 'CRITICAL' || w.latestDcuVerdict === 'UNFIT';
            return (
              <div 
                key={w.id} 
                className={`bg-white rounded-2xl border p-5 transition-all space-y-4 hover:shadow-md flex flex-col justify-between ${
                  isCritical 
                    ? 'border-rose-300/80 shadow-xs ring-1 ring-rose-200/50' 
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {w.gender === 'MALE' ? '👨‍💼' : '👩‍💼'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {w.nameSynthetic}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {w.pseudonymId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {w.jobTitle} • {w.department}
                        </p>
                      </div>
                    </div>
                    {getRiskBadge(w.riskTier)}
                  </div>

                  {/* Worker Vitals & K3 Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Tensi Terakhir (MCU)</span>
                      <div className="font-mono font-bold text-slate-800">
                        {w.latestBp || '120/80'} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Status Pre-Shift (DCU)</span>
                      <div className={`font-bold text-xs ${
                        w.latestDcuVerdict === 'UNFIT' ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {w.latestDcuVerdict === 'UNFIT' ? 'Restricted / Unfit' : 'Fit Pre-Shift'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                    <span>Usia: <strong className="text-slate-600 font-semibold">{w.age} th</strong> ({w.gender})</span>
                    <span>Bahaya: <strong className="text-slate-600 font-semibold">{w.jobHazardCategory}</strong></span>
                    <span>Masa Kerja: <strong className="text-slate-600 font-semibold">{Math.round(w.tenureMonths / 12)} th</strong></span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/worker/${w.pseudonymId}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 hover:border-rose-200 transition shadow-2xs group"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
                    <span>Buka Rekam Medis & AI CDSS</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
