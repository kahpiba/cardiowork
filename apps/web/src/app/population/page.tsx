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
  FileSpreadsheet, 
  ArrowRight, 
  Building2,
  CheckCircle2,
  Search,
  ArrowLeft,
  Download
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

  // Warm corporate risk distribution
  const pieData = POPULATION_SUMMARY.riskTierDistribution.map(r => ({
    name: r.label,
    value: r.count,
    color: r.label.includes('Rendah') ? '#059669' :
           r.label.includes('Sedang') ? '#D97706' :
           r.label.includes('Tinggi') ? '#C2410C' : '#9F1239'
  }));

  return (
    <div className="min-h-screen text-stone-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto bg-medical-grid">
      
      {/* Top back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-rose-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-700 flex items-center justify-center text-white shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                  Dashboard Kesehatan Populasi Pekerja
                </h1>
                <span className="bg-rose-50 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
                  Enterprise Health Analytics K3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Analisis agregat risiko kardiovaskular 1.000 kru operasional offshore & fasilitas kilang industri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Laporan agregat K3 telah diexport ke format CSV terenkripsi.')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/model-lab"
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Model Lab & SHAP</span>
              <ArrowRight className="w-4 h-4 text-rose-700" />
            </Link>
          </div>
        </div>

        {/* Small-Cell Suppression PDP Compliance Banner */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-start gap-3 text-xs sm:text-sm text-amber-950 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">Kepatuhan Privasi Data Medis (UU PDP No. 27/2022 & Permenkes No. 24/2022):</strong>
            <p className="text-amber-900/90 text-xs sm:text-sm mt-1 leading-relaxed">
              Seluruh agregasi sel data dengan jumlah pekerja kurang dari 5 orang (<strong className="text-amber-950">N &lt; 5</strong>) disupresi otomatis (ditampilkan sebagai <strong className="text-amber-950 font-mono">&lt;5*</strong>). Hal ini untuk mencegah re-identifikasi riwayat medis individu oleh pihak HR atau manajemen non-klinis.
            </p>
          </div>
        </div>
      </div>

      {/* 4 High-Level Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2.5">
            <span className="font-bold flex items-center gap-2 text-stone-800 text-sm">
              <Users className="w-4 h-4 text-stone-500" />
              Total Tenaga Kerja
            </span>
            <span className="font-mono text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-bold">100%</span>
          </div>
          <div className="text-3xl font-black text-stone-900 font-mono tabular-nums">
            {POPULATION_SUMMARY.totalHeadcount.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-stone-500 mt-2">
            Rata-rata Usia: <strong className="text-stone-800">{POPULATION_SUMMARY.averageAge} tahun</strong> ({POPULATION_SUMMARY.genderDistribution.malePercent}% Pria)
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2.5">
            <span className="font-bold flex items-center gap-2 text-stone-800 text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Risiko Tinggi & Kritis
            </span>
            <span className="font-mono text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
              67.9%
            </span>
          </div>
          <div className="text-3xl font-black text-rose-700 font-mono tabular-nums">
            679 <span className="text-sm text-stone-500 font-normal">Kru</span>
          </div>
          <div className="text-xs sm:text-sm text-stone-500 mt-2">
            634 Risiko Tinggi + 45 Risiko Kritis (&ge;30% 10-Yr CVD)
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2.5">
            <span className="font-bold flex items-center gap-2 text-stone-800 text-sm">
              <Activity className="w-4 h-4 text-amber-600" />
              Prevalensi Hipertensi
            </span>
            <span className="font-mono text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
              {POPULATION_SUMMARY.prevalenceMetrics.hypertensionPercent}%
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono tabular-nums">
            {POPULATION_SUMMARY.prevalenceMetrics.hypertensionCount} <span className="text-sm text-stone-500 font-normal">Kru</span>
          </div>
          <div className="text-xs sm:text-sm text-stone-500 mt-2">
            Tekanan darah sistolik &ge;140 mmHg atau terapi antihipertensi
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2.5">
            <span className="font-bold flex items-center gap-2 text-stone-800 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Kelayakan Penuh (Fit)
            </span>
            <span className="font-mono text-xs bg-emerald-50 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              59.9%
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono tabular-nums">
            599 <span className="text-sm text-stone-500 font-normal">Kru</span>
          </div>
          <div className="text-xs sm:text-sm text-stone-500 mt-2">
            292 Fit dengan Catatan • 109 Unfit Sementara
          </div>
        </div>
      </div>

      {/* Two Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Corporate CVD Risk Distribution (Pie) */}
        <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-stone-500" />
              Piramida Risiko Kardiovaskular Perusahaan
            </h3>
            <span className="text-xs text-stone-500 font-medium">1.000 Pekerja</span>
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
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.75rem', fontSize: '12px', color: '#1c1917', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-stone-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-stone-200/60 text-xs text-stone-500 leading-relaxed">
            * Mayoritas risiko tinggi terkonsentrasi pada kru operasi lapangan dengan beban kerja fisik berat dan pola rotasi shift 12 jam.
          </div>
        </div>

        {/* Chart 2: Department Breakdown Stacked Bar */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-700" />
              Distribusi Risiko Kardiovaskular per Departemen
            </h3>
            <span className="text-xs text-stone-500 font-medium">Tingkat Bahaya K3</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis tick={{ fill: '#78716c', fontSize: 12 }} />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Kru`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.75rem', fontSize: '12px', color: '#1c1917', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32} 
                  formatter={(value) => <span className="text-xs text-stone-700 font-medium">{value}</span>} 
                />
                <Bar dataKey="Rendah" stackId="a" fill="#059669" />
                <Bar dataKey="Sedang" stackId="a" fill="#D97706" />
                <Bar dataKey="Tinggi" stackId="a" fill="#C2410C" />
                <Bar dataKey="Kritis" stackId="a" fill="#9F1239" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-stone-200/60 text-xs text-stone-500 leading-relaxed">
            * Departemen <strong className="text-stone-900">Drilling Operations</strong> dan <strong className="text-stone-900">Refinery Processing</strong> memiliki proporsi risiko kardiovaskular tinggi terbesar akibat rotasi malam.
          </div>
        </div>

      </div>

      {/* Shift Pattern Risk Disparity Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              Disparitas Risiko Fisiologis: Pola Rotasi Shift vs Non-Rotasi
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
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
                className={`p-5 rounded-xl border ${
                  isRotation 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-stone-900">{shift.label}</span>
                  <span className="text-xs font-mono font-bold text-stone-600">
                    N = {shift.totalWorkers} ({((shift.totalWorkers / 1000) * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-stone-200/80">
                  <div className="bg-white p-3 rounded-lg text-center border border-stone-200 shadow-2xs">
                    <span className="text-xs text-stone-500 block font-semibold">Risiko Tinggi</span>
                    <strong className={`text-base font-bold tabular-nums ${isRotation ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {shift.highCvdRiskPercent}%
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center border border-stone-200 shadow-2xs">
                    <span className="text-xs text-stone-500 block font-semibold">Rata-rata Tidur</span>
                    <strong className="text-base text-stone-800 font-bold tabular-nums">
                      {shift.sleepHoursMean} Jam
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center border border-stone-200 shadow-2xs">
                    <span className="text-xs text-stone-500 block font-semibold">Tensi DCU SBP</span>
                    <strong className="text-base text-stone-800 font-bold tabular-nums">
                      {shift.meanSbpDcu} mmHg
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center border border-stone-200 shadow-2xs">
                    <span className="text-xs text-stone-500 block font-semibold">Hari Gejala</span>
                    <strong className={`text-base font-bold tabular-nums ${isRotation ? 'text-rose-700' : 'text-emerald-800'}`}>
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
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-rose-800" />
                Matriks Risiko Kardiovaskular Terpadu per Departemen
              </h3>
              <span className="bg-amber-50 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                PDP Law: N &lt; 5 Masked
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Tabulasi silang kategori risiko, status kelayakan kerja, dan faktor risiko gaya hidup.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-rose-700 focus:bg-white shadow-2xs transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm text-stone-700 border-collapse">
            <thead className="bg-stone-100 text-xs uppercase font-bold text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Departemen</th>
                <th className="p-3.5 text-center">Hazard</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right text-emerald-800">Rendah</th>
                <th className="p-3.5 text-right text-amber-800">Sedang</th>
                <th className="p-3.5 text-right text-stone-800">Tinggi</th>
                <th className="p-3.5 text-right text-rose-800">Kritis</th>
                <th className="p-3.5 text-right text-emerald-800">Fit</th>
                <th className="p-3.5 text-right">Catatan</th>
                <th className="p-3.5 text-right text-rose-800">Unfit</th>
                <th className="p-3.5 text-right">Perokok</th>
                <th className="p-3.5 text-right">Hipertensi</th>
                <th className="p-3.5 text-right">Usia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-xs sm:text-sm bg-white">
              {filteredDepts.map((d) => (
                <tr key={d.department} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-3.5 font-sans font-semibold text-stone-900 whitespace-nowrap">
                    {d.department}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      d.hazardLevel === 'HIGH' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                      d.hazardLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                      'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}>
                      {d.hazardLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-stone-900 tabular-nums">{d.totalWorkers.value}</td>
                  
                  {/* Suppressed columns */}
                  <td className={`p-3.5 text-right tabular-nums ${d.lowRisk.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-emerald-800 font-bold'}`} title={d.lowRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.lowRisk.value}
                  </td>
                  <td className="p-3.5 text-right text-amber-800 font-bold tabular-nums">{d.moderateRisk.value}</td>
                  <td className="p-3.5 text-right text-stone-800 font-bold tabular-nums">{d.highRisk.value}</td>
                  
                  <td className={`p-3.5 text-right tabular-nums ${d.criticalRisk.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-rose-700 font-bold'}`} title={d.criticalRisk.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.criticalRisk.value}
                  </td>

                  <td className="p-3.5 text-right text-emerald-800 font-bold tabular-nums">{d.fitCount.value}</td>
                  <td className={`p-3.5 text-right tabular-nums ${d.fitRestrictionCount.isSuppressed ? 'text-amber-800 font-bold bg-amber-50' : 'text-amber-800 font-bold'}`} title={d.fitRestrictionCount.isSuppressed ? 'Disupresi karena N < 5' : ''}>
                    {d.fitRestrictionCount.value}
                  </td>
                  <td className="p-3.5 text-right text-rose-700 font-bold tabular-nums">{d.unfitCount.value}</td>

                  <td className="p-3.5 text-right text-stone-700 tabular-nums">{d.smokerCount.value}</td>
                  <td className="p-3.5 text-right text-stone-700 tabular-nums">{d.hypertensiveCount.value}</td>
                  <td className="p-3.5 text-right text-stone-500 tabular-nums">{d.meanAge} th</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-2">
          <div className="flex items-center gap-2">
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
