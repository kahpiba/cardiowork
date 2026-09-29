'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { 
  Clock, 
  Heart, 
  AlertTriangle, 
  Moon, 
  Activity, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import { DcuRecordInput } from '@cardiowork/shared';
import { EducationalEmptyState } from '@/components/EducationalEmptyState';

interface DcuTrendChartProps {
  records: DcuRecordInput[];
}

export function DcuTrendChart({ records }: DcuTrendChartProps) {
  const [activeMetricTab, setActiveMetricTab] = useState<'hemodynamics' | 'wellness'>('hemodynamics');
  const [showTableModal, setShowTableModal] = useState<boolean>(false);

  // Sort ascending by recorded date
  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <EducationalEmptyState
        title="Belum Ada Catatan Daily Check-Up (DCU)"
        description="Pekerja belum memiliki data tanda vital pra-shift dalam 30 hari terakhir. Pengukuran pertama di Kios Paramedis akan otomatis mengaktifkan grafik tren hemodinamik ini."
        actionHref="/kiosk"
        actionText="Buka Kios DCU untuk Input Data"
        icon="activity"
      />
    );
  }

  // Format data for Recharts
  const chartData = sorted.map((r) => {
    const d = new Date(r.recordedAt);
    const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}`;
    const pulsePressure = r.systolicBp - r.diastolicBp;
    const isHypertensive = r.systolicBp >= 140 || r.diastolicBp >= 90;

    return {
      date: dateFormatted,
      fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      systolicBp: r.systolicBp,
      diastolicBp: r.diastolicBp,
      heartRate: r.restingHeartRate,
      pulsePressure,
      spo2Percent: r.spo2Percent,
      sleepHours: r.sleepHoursLast24h,
      bodyTemp: r.bodyTemperatureC,
      isHypertensive,
      shift: r.shiftType === 'NIGHT_SHIFT' ? 'Shift Malam' : r.shiftType === 'DAY_SHIFT' ? 'Shift Pagi' : 'Shift Tengah',
      hasSymptoms: r.chestPainFlag || r.shortnessOfBreathFlag || r.dizzinessFlag || r.palpitationsFlag,
      chestPain: r.chestPainFlag,
      sob: r.shortnessOfBreathFlag,
      dizziness: r.dizzinessFlag,
      palpitations: r.palpitationsFlag,
      entryMode: r.entryMode === 'SELF_SERVICE_KIOSK' ? 'Kios Mandiri' : 'Didampingi Paramedis'
    };
  });

  // Summary statistics
  const sbpList = sorted.map((r) => r.systolicBp);
  const dbpList = sorted.map((r) => r.diastolicBp);
  const hrList = sorted.map((r) => r.restingHeartRate);
  const sleepList = sorted.map((r) => r.sleepHoursLast24h);

  const avgSbp = Math.round(sbpList.reduce((a, b) => a + b, 0) / sbpList.length);
  const avgDbp = Math.round(dbpList.reduce((a, b) => a + b, 0) / dbpList.length);
  const avgHr = Math.round(hrList.reduce((a, b) => a + b, 0) / hrList.length);
  const avgSleep = Math.round((sleepList.reduce((a, b) => a + b, 0) / sleepList.length) * 10) / 10;

  // SBP Standard Deviation (Blood Pressure Variability)
  const sbpVariance = sbpList.reduce((acc, val) => acc + Math.pow(val - avgSbp, 2), 0) / sbpList.length;
  const sbpStdDev = Math.round(Math.sqrt(sbpVariance) * 10) / 10;

  // Count red flag days
  const hypertensiveDays = sorted.filter((r) => r.systolicBp >= 140 || r.diastolicBp >= 90).length;
  const symptomDays = sorted.filter(
    (r) => r.chestPainFlag || r.shortnessOfBreathFlag || r.dizzinessFlag || r.palpitationsFlag
  ).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-teal-600 animate-pulse" />
            <h2 className="font-bold text-slate-900 text-sm tracking-wide">
              Tren Hemodinamik Harian — Daily Check-Up (DCU 30 Hari)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fluktuasi tekanan darah, laju nadi istirahat, dan oksigenasi sebelum shift kerja (Pre-Shift Screening).
          </p>
        </div>

        {/* View toggle & Table Access */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTableModal(!showTableModal)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Buka tabel aksesibilitas screen reader"
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{showTableModal ? 'Sembunyikan Tabel' : 'Format Tabel'}</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveMetricTab('hemodynamics')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMetricTab === 'hemodynamics' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tekanan Darah & Nadi
            </button>
            <button
              onClick={() => setActiveMetricTab('wellness')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMetricTab === 'wellness' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SpO2 & Jam Tidur
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards with Tabular Nums */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] text-slate-500 block">Rata-rata Tensi (30 Hari)</span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {avgSbp} / {avgDbp} <span className="text-xs text-slate-500 font-sans font-normal">mmHg</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-block font-semibold ${
            avgSbp >= 130 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-teal-100 text-teal-800 border-teal-200'
          }`}>
            {avgSbp >= 130 ? 'Borderline Elevasi' : 'Rentang Normal'}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] text-slate-500 block">Variabilitas SBP (SD)</span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            ±{sbpStdDev} <span className="text-xs text-slate-500 font-sans font-normal">mmHg</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-block font-semibold ${
            sbpStdDev >= 12 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {sbpStdDev >= 12 ? 'Fluktuasi Tinggi' : 'Variabilitas Terkontrol'}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] text-slate-500 block">Hari Hipertensi (≥140/90)</span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {hypertensiveDays} <span className="text-xs text-slate-500 font-sans font-normal">/ {sorted.length} Hari</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-block font-semibold ${
            hypertensiveDays > 5 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-teal-100 text-teal-800 border-teal-200'
          }`}>
            {Math.round((hypertensiveDays / sorted.length) * 100)}% dari total shift
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] text-slate-500 block">Rata-rata Tidur 24 Jam</span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {avgSleep} <span className="text-xs text-slate-500 font-sans font-normal">Jam</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-block font-semibold ${
            avgSleep < 6.0 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-teal-100 text-teal-800 border-teal-200'
          }`}>
            {avgSleep < 6.0 ? 'Kurang Tidur (Fatik)' : 'Istirahat Cukup'}
          </span>
        </div>
      </div>

      {/* Red flag symptoms banner if any occurred */}
      {symptomDays > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-rose-900 shadow-2xs">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="font-bold text-rose-900">
              Peringatan Gejala Kardiovaskular Subjektif Terdeteksi ({symptomDays} hari skrining)
            </span>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Pekerja melaporkan keluhan spesifik saat pre-shift screening (nyeri dada / sesak napas / pusing / palpitasi). Sesuai SPO K3, pekerja memerlukan evaluasi klinis mendalam sebelum diizinkan bertugas di area offshore / hazardous area.
            </p>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetricTab === 'hemodynamics' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              {/* Shaded Normal Band 90 - 120 mmHg */}
              <ReferenceArea y1={90} y2={120} fill="#f0fdf4" fillOpacity={0.6} />

              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false} 
              />
              <YAxis 
                domain={[50, 200]} 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false} 
              />
              
              {/* Reference Lines */}
              <ReferenceLine 
                y={140} 
                stroke="#e11d48" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ value: 'Batas Hipertensi (140 mmHg)', fill: '#e11d48', fontSize: 10, position: 'insideTopRight' }} 
              />
              <ReferenceLine 
                y={120} 
                stroke="#0d9488" 
                strokeDasharray="3 3" 
                label={{ value: 'Batas Normal Optimal (120 mmHg)', fill: '#0d9488', fontSize: 10, position: 'insideBottomRight' }} 
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
                        <div className="border-b border-slate-100 pb-1 flex justify-between items-center">
                          <span className="font-bold text-slate-900">{data.fullDate}</span>
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
                            {data.shift}
                          </span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-rose-600 font-medium">Tekanan Sistolik:</span>
                            <span className="font-bold text-slate-900 tabular-nums">{data.systolicBp} mmHg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sky-600 font-medium">Tekanan Diastolik:</span>
                            <span className="font-bold text-slate-900 tabular-nums">{data.diastolicBp} mmHg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-teal-600 font-medium">Denyut Nadi (HR):</span>
                            <span className="font-bold text-slate-900 tabular-nums">{data.heartRate} bpm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-600 font-medium">Pulse Pressure:</span>
                            <span className="font-bold text-slate-900 tabular-nums">{data.pulsePressure} mmHg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-indigo-600 font-medium">Jam Tidur:</span>
                            <span className="font-bold text-slate-900 tabular-nums">{data.sleepHours} Jam</span>
                          </div>
                        </div>
                        {data.hasSymptoms && (
                          <div className="pt-1 mt-1 border-t border-slate-100 text-[10px] text-rose-700 font-sans font-bold">
                            ⚠️ Gejala: {[
                              data.chestPain && 'Nyeri Dada',
                              data.sob && 'Sesak Napas',
                              data.dizziness && 'Pusing',
                              data.palpitations && 'Palpitasi'
                            ].filter(Boolean).join(', ')}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-400 pt-0.5">
                          Mode Entri: {data.entryMode}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }} 
              />
              <Line 
                type="monotone" 
                dataKey="systolicBp" 
                name="Sistolik (SBP)" 
                stroke="#e11d48" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#e11d48' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="diastolicBp" 
                name="Diastolik (DBP)" 
                stroke="#0284c7" 
                strokeWidth={2} 
                dot={{ r: 2.5, fill: '#0284c7' }} 
              />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                name="Denyut Jantung (HR)" 
                stroke="#0d9488" 
                strokeWidth={2} 
                strokeDasharray="2 2"
                dot={{ r: 2.5, fill: '#0d9488' }} 
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis yAxisId="left" domain={[85, 100]} stroke="#0284c7" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 12]} stroke="#7c3aed" tick={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={95} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'SpO2 Kritis (<95%)', fill: '#e11d48', fontSize: 10 }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono">
                        <span className="font-sans font-bold text-slate-900 block">{data.fullDate}</span>
                        <div className="text-sky-700">Saturasi O2: {data.spo2Percent}%</div>
                        <div className="text-purple-700">Durasi Tidur: {data.sleepHours} Jam</div>
                        <div className="text-teal-700">Suhu Tubuh: {data.bodyTemp} °C</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left" type="monotone" dataKey="spo2Percent" name="Saturasi SpO2 (%)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="sleepHours" name="Jam Tidur (Jam)" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Accessible Table Modal / Drawer for Screen Readers & Tabular View */}
      {showTableModal && (
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
            <span>Tabel Riwayat DCU (30 Hari Terakhir)</span>
            <span className="text-[10px] text-slate-500 font-normal">Aksesibilitas Semantik</span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Shift</th>
                  <th className="p-2.5 text-right">Sistolik</th>
                  <th className="p-2.5 text-right">Diastolik</th>
                  <th className="p-2.5 text-right">Nadi</th>
                  <th className="p-2.5 text-right">SpO2</th>
                  <th className="p-2.5 text-right">Tidur</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] bg-white">
                {chartData.map((row, idx) => (
                  <tr key={idx} className={row.isHypertensive ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                    <td className="p-2.5 font-sans font-semibold text-slate-900">{row.fullDate}</td>
                    <td className="p-2.5 font-sans text-slate-500">{row.shift}</td>
                    <td className={`p-2.5 text-right font-bold ${row.systolicBp >= 140 ? 'text-rose-600' : 'text-slate-800'}`}>{row.systolicBp}</td>
                    <td className="p-2.5 text-right text-slate-700">{row.diastolicBp}</td>
                    <td className="p-2.5 text-right text-teal-700">{row.heartRate}</td>
                    <td className="p-2.5 text-right text-sky-700">{row.spo2Percent}%</td>
                    <td className="p-2.5 text-right text-indigo-700">{row.sleepHours}j</td>
                    <td className="p-2.5 font-sans">
                      {row.hasSymptoms ? (
                        <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded">Gejala</span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Notes */}
      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Info className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span>Zona hijau menunjukkan rentang hemodinamik istirahat optimal (90–120 mmHg).</span>
        </div>
        <span className="font-mono text-teal-700 text-[10px] font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          {sorted.length} Data Points • Real-time Sync
        </span>
      </div>

    </div>
  );
}
