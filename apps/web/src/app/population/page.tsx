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
  Search,
  ArrowLeft,
  Download,
  Printer,
  Sparkles
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

  // Color-blind safe corporate risk distribution
  const pieData = POPULATION_SUMMARY.riskTierDistribution.map(r => ({
    name: r.label,
    value: r.count,
    color: r.label.includes('Rendah') ? '#0D9488' :
           r.label.includes('Sedang') ? '#D97706' :
           r.label.includes('Tinggi') ? '#EA580C' : '#BE123C'
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto bg-medical-grid">
      
      {/* Top back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Dashboard Kesehatan Populasi Pekerja
                </h1>
                <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200 shadow-2xs">
                  Enterprise Health Analytics K3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Analisis agregat risiko kardiovaskular 1.000 kru operasional offshore & fasilitas kilang industri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Laporan agregat K3 telah diexport ke format CSV terenkripsi.')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/model-lab"
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Model Lab & SHAP</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
            </Link>
          </div>
        </div>

        {/* Small-Cell Suppression PDP Compliance Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">Kepatuhan Privasi Data Medis (UU PDP No. 27/2022 & Permenkes No. 24/2022):</strong>
            <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
              Seluruh agregasi sel data dengan jumlah pekerja kurang dari 5 orang (<strong className="text-amber-950">N &lt; 5</strong>) disupresi otomatis (ditampilkan sebagai <strong className="text-amber-950 font-mono">&lt;5*</strong>). Hal ini untuk mencegah re-identifikasi riwayat medis individu oleh pihak HR atau manajemen non-klinis.
            </p>
          </div>
        </div>
      </div>

      {/* 4 High-Level Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              <Users className="w-4 h-4 text-indigo-600" />
              Total Tenaga Kerja Terdata
            </span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">100%</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">
            {POPULATION_SUMMARY.totalHeadcount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Rata-rata Usia: <strong className="text-slate-800">{POPULATION_SUMMARY.averageAge} tahun</strong> ({POPULATION_SUMMARY.genderDistribution.malePercent}% Pria)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Risiko Tinggi & Kritis
            </span>
            <span className="font-mono text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
              67.9%
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono tabular-nums">
            679 <span className="text-xs text-slate-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            634 Risiko Tinggi + 45 Risiko Kritis (&ge;30% 10-Yr CVD)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              <Activity className="w-4 h-4 text-amber-600" />
              Prevalensi Hipertensi
            </span>
            <span className="font-mono text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
              {POPULATION_SUMMARY.prevalenceMetrics.hypertensionPercent}%
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono tabular-nums">
            {POPULATION_SUMMARY.prevalenceMetrics.hypertensionCount} <span className="text-xs text-slate-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Tekanan darah sistolik &ge;140 mmHg atau terapi antihipertensi
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Kelayakan Kerja Penuh (Fit)
            </span>
            <span className="font-mono text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-bold">
              59.9%
            </span>
          </div>
          <div className="text-3xl font-black text-teal-600 font-mono tabular-nums">
            599 <span className="text-xs text-slate-500 font-normal">Kru</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            292 Fit dengan Catatan • 109 Unfit Sementara
          </div>
        </div>
      </div>

      {/* Two Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Corporate CVD Risk Distribution (Pie) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              Piramida Risiko Kardiovaskular Perusahaan
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">1.000 Pekerja</span>
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
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            * Mayoritas risiko tinggi terkonsentrasi pada kru operasi lapangan dengan beban kerja fisik berat dan pola rotasi shift 12 jam.
          </div>
        </div>

        {/* Chart 2: Department Breakdown Stacked Bar */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Distribusi Risiko Kardiovaskular per Departemen
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Tingkat Bahaya K3</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Kru`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32} 
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>} 
                />
                <Bar dataKey="Rendah" stackId="a" fill="#0D9488" />
                <Bar dataKey="Sedang" stackId="a" fill="#D97706" />
                <Bar dataKey="Tinggi" stackId="a" fill="#EA580C" />
                <Bar dataKey="Kritis" stackId="a" fill="#BE123C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            * Departemen <strong className="text-slate-800">Drilling Operations</strong> dan <strong className="text-slate-800">Refinery Processing</strong> memiliki proporsi risiko kardiovaskular tinggi terbesar akibat rotasi malam.
          </div>
        </div>

      </div>

      {/* Shift Pattern Risk Disparity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Disparitas Risiko Fisiologis: Pola Rotasi Shift vs Non-Rotasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
                    ? 'bg-rose-50/70 border-rose-200' 
                    : 'bg-teal-50/70 border-teal-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{shift.label}</span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    N = {shift.totalWorkers} ({((shift.totalWorkers / 1000) * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60">
                  <div className="bg-white p-2.5 rounded-lg text-center border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-semibold">Risiko Tinggi</span>
                    <strong className={`text-sm font-bold tabular-nums ${isRotation ? 'text-rose-600' : 'text-teal-700'}`}>
                      {shift.highCvdRiskPercent}%
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg text-center border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-semibold">Rata-rata Tidur</span>
                    <strong className="text-sm text-slate-800 font-bold tabular-nums">
                      {shift.sleepHoursMean} Jam
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg text-center border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-semibold">Tensi DCU SBP</span>
                    <strong className="text-sm text-slate-800 font-bold tabular-nums">
                      {shift.meanSbpDcu} mmHg
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg text-center border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-semibold">Hari Ada Gejala</span>
                    <strong className={`text-sm font-bold tabular-nums ${isRotation ? 'text-rose-600' : 'text-teal-700'}`}>
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                Matriks Risiko Kardiovaskular Terpadu per Departemen
              </h3>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shadow-2xs">
                <Lock className="w-3 h-3 text-amber-600" />
                PDP Law: N &lt; 5 Masked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabulasi silang kategori risiko, status kelayakan kerja, dan faktor risiko gaya hidup.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white shadow-2xs transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Departemen</th>
                <th className="p-3 text-center">Hazard</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right text-teal-800">Rendah</th>
                <th className="p-3 text-right text-amber-800">Sedang</th>
                <th className="p-3 text-right text-orange-800">Tinggi</th>
                <th className="p-3 text-right text-rose-800">Kritis</th>
                <th className="p-3 text-right">Fit</th>
                <th className="p-3 text-right">Catatan</th>
                <th className="p-3 text-right text-rose-800">Unfit</th>
                <th className="p-3 text-right">Perokok</th>
                <th className="p-3 text-right">Hipertensi</th>
                <th className="p-3 text-right">Usia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono bg-white">
              {filteredDepts.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {d.department}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      d.hazardLevel === 'HIGH' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                      d.hazardLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-teal-50 border-teal-200 text-teal-800'
                    }`}>
                      {d.hazardLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 tabular-nums">{d.totalWorkers.value}</td>
                  
                  {/* Suppressed columns */}
                  <td className={`p-3 text-right tabular-nums ${d.lowRisk.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-teal-700 font-bold'}`} title={d.lowRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.lowRisk.value}
                  </td>
                  <td className="p-3 text-right text-amber-700 font-bold tabular-nums">{d.moderateRisk.value}</td>
                  <td className="p-3 text-right text-orange-700 font-bold tabular-nums">{d.highRisk.value}</td>
                  
                  <td className={`p-3 text-right tabular-nums ${d.criticalRisk.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-rose-700 font-bold'}`} title={d.criticalRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.criticalRisk.value}
                  </td>

                  <td className="p-3 text-right text-teal-700 font-bold tabular-nums">{d.fitCount.value}</td>
                  <td className={`p-3 text-right tabular-nums ${d.fitRestrictionCount.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-amber-700 font-bold'}`} title={d.fitRestrictionCount.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.fitRestrictionCount.value}
                  </td>
                  <td className="p-3 text-right text-rose-700 font-bold tabular-nums">{d.unfitCount.value}</td>

                  <td className="p-3 text-right text-slate-700 tabular-nums">{d.smokerCount.value}</td>
                  <td className="p-3 text-right text-slate-700 tabular-nums">{d.hypertensiveCount.value}</td>
                  <td className="p-3 text-right text-slate-500 tabular-nums">{d.meanAge} th</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-xs" />
            <span>Tanda <strong className="text-amber-800 font-mono font-bold">&lt;5*</strong> menandakan data disupresi otomatis sesuai standar privasi UU PDP No. 27/2022.</span>
          </div>
          <div>
            Data tersinkronisasi dari 1.000 rekam medis MCU tahunan & 59.693 DCU harian.
          </div>
        </div>
      </div>

    </div>
  );
}
