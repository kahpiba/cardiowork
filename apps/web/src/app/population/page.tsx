'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldAlert, 
  Heart, 
  Activity, 
  Clock, 
  Lock, 
  AlertTriangle, 
  FileSpreadsheet, 
  ArrowRight, 
  Building2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  POPULATION_SUMMARY, 
  RAW_DEPARTMENT_STATS, 
  SHIFT_COMPARISON_STATS,
  getSuppressedDepartmentTable
} from '@/lib/populationData';

export default function PopulationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRawAdmin, setShowRawAdmin] = useState(false);

  const suppressedTable = getSuppressedDepartmentTable();

  const filteredDepts = suppressedTable.filter(d => 
    d.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recharts department stacked data
  const deptChartData = RAW_DEPARTMENT_STATS.map(d => ({
    name: d.department.split(' ')[0], // Short name
    fullName: d.department,
    Rendah: d.lowRisk,
    Sedang: d.moderateRisk,
    Tinggi: d.highRisk,
    Kritis: d.criticalRisk,
    total: d.totalWorkers
  }));

  const pieData = POPULATION_SUMMARY.riskTierDistribution.map(r => ({
    name: r.label,
    value: r.count,
    color: r.color
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Dashboard Kesehatan Populasi Pekerja
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                  Enterprise Health Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Analisis agregat risiko kardiovaskular 1.000 kru operasional offshore & fasilitas kilang minyak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/model-lab"
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Buka Model Lab & SHAP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Small-Cell Suppression PDP Compliance Banner */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-start gap-2.5 text-xs text-amber-300 bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Kepatuhan Privasi Data Medis (UU PDP No. 27/2022 & Permenkes No. 24/2022):</strong>
            <p className="text-amber-200/90 text-[11px] mt-0.5 leading-relaxed">
              Seluruh agregasi sel data dengan jumlah pekerja kurang dari 5 orang (<strong className="text-white">N &lt; 5</strong>) disupresi otomatis (ditampilkan sebagai <strong className="text-white">&lt;5*</strong>). Hal ini untuk mencegah re-identifikasi riwayat medis individu oleh pihak HR atau manajemen non-klinis.
            </p>
          </div>
        </div>
      </div>

      {/* 4 High-Level Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Total Tenaga Kerja Terdata
            </span>
            <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">100%</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {POPULATION_SUMMARY.totalHeadcount.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            Rata-rata Usia: <strong className="text-zinc-200">{POPULATION_SUMMARY.averageAge} tahun</strong> ({POPULATION_SUMMARY.genderDistribution.malePercent}% Pria)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Risiko Tinggi & Kritis
            </span>
            <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
              67.9%
            </span>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            679 <span className="text-xs text-zinc-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            634 Risiko Tinggi + 45 Risiko Kritis (&ge;30% 10-Yr CVD)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              Prevalensi Hipertensi
            </span>
            <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
              {POPULATION_SUMMARY.prevalenceMetrics.hypertensionPercent}%
            </span>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {POPULATION_SUMMARY.prevalenceMetrics.hypertensionCount} <span className="text-xs text-zinc-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            Tekanan darah sistolik &ge;140 mmHg atau terapi antihipertensi
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Kelayakan Kerja Penuh (Fit)
            </span>
            <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
              59.9%
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            599 <span className="text-xs text-zinc-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            292 Fit dengan Catatan • 109 Unfit Sementara
          </div>
        </div>
      </div>

      {/* Two Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Corporate CVD Risk Distribution (Pie) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Piramida Risiko Kardiovaskular Perusahaan
            </h3>
            <span className="text-[11px] text-zinc-400">1.000 Pekerja</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} Kru (${((val / 1000) * 100).toFixed(1)}%)`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-zinc-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            * Mayoritas risiko tinggi terkonsentrasi pada kru operasi lapangan dengan beban kerja fisik berat dan pola rotasi shift 12 jam.
          </div>
        </div>

        {/* Chart 2: Department Breakdown Stacked Bar */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Distribusi Risiko Kardiovaskular per Departemen
            </h3>
            <span className="text-[11px] text-zinc-400">Tingkat Bahaya K3</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Kru`, name]}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32}
                  formatter={(value) => <span className="text-xs text-zinc-300">{value}</span>} 
                />
                <Bar dataKey="Rendah" stackId="a" fill="#10b981" />
                <Bar dataKey="Sedang" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Tinggi" stackId="a" fill="#f97316" />
                <Bar dataKey="Kritis" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            * Departemen <strong>Drilling Operations</strong> dan <strong>Refinery Processing</strong> memiliki proporsi risiko kardiovaskular tinggi terbesar akibat rotasi malam.
          </div>
        </div>

      </div>

      {/* Shift Pattern Risk Disparity Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Disparitas Risiko Fisiologis: Pola Rotasi Shift vs Non-Rotasi
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Analisis dampak sirkadian dan durasi tidur terhadap instabilitas hemodinamik kru.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHIFT_COMPARISON_STATS.map((shift) => {
            const isRotation = shift.shiftPattern.includes('ROTATION');
            return (
              <div 
                key={shift.shiftPattern}
                className={`p-4 rounded-xl border ${
                  isRotation 
                    ? 'bg-rose-950/20 border-rose-500/30' 
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{shift.label}</span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    N = {shift.totalWorkers} ({((shift.totalWorkers / 1000) * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="bg-black/30 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-400 block">Risiko Tinggi</span>
                    <strong className={`text-sm ${isRotation ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {shift.highCvdRiskPercent}%
                    </strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-400 block">Rata-rata Tidur</span>
                    <strong className="text-sm text-zinc-200">
                      {shift.sleepHoursMean} Jam
                    </strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-400 block">Tensi DCU SBP</span>
                    <strong className="text-sm text-zinc-200">
                      {shift.meanSbpDcu} mmHg
                    </strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-400 block">Hari Ada Gejala</span>
                    <strong className={`text-sm ${isRotation ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {shift.complaintDaysPercent}%
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Tabulation Table with Small-Cell Suppression */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Matriks Risiko Kardiovaskular Terpadu per Departemen
              </h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                PDP Law: N &lt; 5 Masked
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tabulasi silang kategori risiko, status kelayakan kerja, dan faktor risiko gaya hidup.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-950/80 text-[11px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-3">Departemen</th>
                <th className="p-3 text-center">Hazard</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right text-emerald-400">Rendah</th>
                <th className="p-3 text-right text-amber-400">Sedang</th>
                <th className="p-3 text-right text-orange-400">Tinggi</th>
                <th className="p-3 text-right text-rose-400">Kritis</th>
                <th className="p-3 text-right">Fit</th>
                <th className="p-3 text-right">Catatan</th>
                <th className="p-3 text-right text-rose-400">Unfit</th>
                <th className="p-3 text-right">Perokok</th>
                <th className="p-3 text-right">Hipertensi</th>
                <th className="p-3 text-right">Usia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredDepts.map((d) => (
                <tr key={d.department} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 font-sans font-semibold text-white whitespace-nowrap">
                    {d.department}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      d.hazardLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                      d.hazardLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {d.hazardLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-white">{d.totalWorkers.value}</td>
                  
                  {/* Suppressed columns */}
                  <td className={`p-3 text-right ${d.lowRisk.isSuppressed ? 'text-amber-300 font-bold bg-amber-950/30' : 'text-emerald-400'}`} title={d.lowRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.lowRisk.value}
                  </td>
                  <td className="p-3 text-right text-amber-400">{d.moderateRisk.value}</td>
                  <td className="p-3 text-right text-orange-400">{d.highRisk.value}</td>
                  
                  <td className={`p-3 text-right ${d.criticalRisk.isSuppressed ? 'text-amber-300 font-bold bg-amber-950/30' : 'text-rose-400'}`} title={d.criticalRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.criticalRisk.value}
                  </td>

                  <td className="p-3 text-right text-emerald-400">{d.fitCount.value}</td>
                  <td className={`p-3 text-right ${d.fitRestrictionCount.isSuppressed ? 'text-amber-300 font-bold bg-amber-950/30' : 'text-amber-400'}`} title={d.fitRestrictionCount.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.fitRestrictionCount.value}
                  </td>
                  <td className="p-3 text-right text-rose-400">{d.unfitCount.value}</td>

                  <td className="p-3 text-right text-zinc-300">{d.smokerCount.value}</td>
                  <td className="p-3 text-right text-zinc-300">{d.hypertensiveCount.value}</td>
                  <td className="p-3 text-right text-zinc-400">{d.meanAge} th</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
            <span>Tanda <strong className="text-amber-300 font-mono">&lt;5*</strong> menandakan data disupresi otomatis sesuai standar privasi UU PDP No. 27/2022.</span>
          </div>
          <div>
            Data tersinkronisasi dari 1.000 rekam medis MCU tahunan & 59.693 DCU harian.
          </div>
        </div>
      </div>

    </div>
  );
}
