'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { McuRecordInput } from '@cardiowork/shared';

interface McuLongitudinalComparisonProps {
  records: McuRecordInput[];
}

export function McuLongitudinalComparison({ records }: McuLongitudinalComparisonProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'hemodynamics' | 'lipid' | 'metabolic'>('all');

  // Sort ascending by examination date
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.examinationDate).getTime() - new Date(b.examinationDate).getTime()
  );

  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
        <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-pulse" />
        Belum ada riwayat MCU tahunan yang tercatat.
      </div>
    );
  }

  const latest = sortedRecords[sortedRecords.length - 1];
  const previous = sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2] : null;

  // Delta helpers
  const getDeltaBadge = (
    currentVal: number | undefined, 
    prevVal: number | undefined, 
    unit: string, 
    isLowerBetter: boolean = true
  ) => {
    if (currentVal === undefined || prevVal === undefined) return null;
    const diff = currentVal - prevVal;
    if (diff === 0) {
      return (
        <span className="text-xs text-stone-500 font-mono px-2 py-0.5 rounded bg-stone-100 border border-stone-200 font-medium">
          Stabil (0 {unit})
        </span>
      );
    }

    const isWorse = isLowerBetter ? diff > 0 : diff < 0;
    const formattedDiff = `${diff > 0 ? '+' : ''}${Math.round(diff * 10) / 10} ${unit}`;

    return (
      <span className={`inline-flex items-center space-x-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
        isWorse 
          ? 'bg-rose-50 text-rose-800 border-rose-200' 
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}>
        {isWorse ? <TrendingUp className="h-3.5 w-3.5 mr-0.5 text-rose-700" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5 text-emerald-700" />}
        {formattedDiff}
      </span>
    );
  };

  // Derived metrics
  const getPulsePressure = (sbp: number, dbp: number) => sbp - dbp;
  const getMap = (sbp: number, dbp: number) => Math.round((2 * dbp + sbp) / 3);
  const getTgHdlRatio = (tg: number, hdl: number) => Math.round((tg / (hdl || 1)) * 10) / 10;

  // Clinical risk check flags
  const flags: { label: string; level: 'warning' | 'critical' | 'info'; detail: string }[] = [];

  if (latest.systolicBp >= 140 || latest.diastolicBp >= 90) {
    flags.push({
      label: 'Hipertensi Grade 1/2',
      level: latest.systolicBp >= 160 ? 'critical' : 'warning',
      detail: `Tekanan darah terkini ${latest.systolicBp}/${latest.diastolicBp} mmHg melampaui ambang batas normal.`
    });
  }

  const latestPP = getPulsePressure(latest.systolicBp, latest.diastolicBp);
  if (latestPP >= 60) {
    flags.push({
      label: 'Kekakuan Arteri (Pulse Pressure ≥60)',
      level: 'warning',
      detail: `Tekanan nadi ${latestPP} mmHg mengindikasikan kekakuan vaskular (arterial stiffness).`
    });
  }

  const latestTgHdl = getTgHdlRatio(latest.triglyceridesMgdl, latest.hdlCholesterolMgdl);
  if (latestTgHdl >= 3.0) {
    flags.push({
      label: 'Partikel Aterogenik Tinggi (TG/HDL ≥3.0)',
      level: 'warning',
      detail: `Rasio Trigliserida/HDL ${latestTgHdl} berkorelasi dengan partikel small-dense LDL atherogenic.`
    });
  }

  if (latest.fastingGlucoseMgdl >= 126 || (latest.hba1cPercent && latest.hba1cPercent >= 6.5)) {
    flags.push({
      label: 'Kriteria Diabetes Mellitus',
      level: 'critical',
      detail: `GDP ${latest.fastingGlucoseMgdl} mg/dL atau HbA1c ${latest.hba1cPercent}% memenuhi ambang DM PERKENI.`
    });
  } else if (latest.fastingGlucoseMgdl >= 100) {
    flags.push({
      label: 'Prediabetes (Impaired Fasting Glucose)',
      level: 'warning',
      detail: `GDP ${latest.fastingGlucoseMgdl} mg/dL pada rentang prediabetes (100–125 mg/dL).`
    });
  }

  if (latest.bmi >= 25.0) {
    flags.push({
      label: 'Obesitas (Kriteria WHO Asia Pasifik)',
      level: 'warning',
      detail: `IMT ${latest.bmi} kg/m² melampaui batas obesitas Asia Pasifik (≥25.0 kg/m²).`
    });
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm tracking-wide">
                Rekam Medis Berkala (MCU Longitudinal 3 Tahun)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Analisis komparatif delta tahunan parameter klinis dan biomarker kardiovaskular pekerja.
              </p>
            </div>
          </div>
        </div>

        {/* Tab filters */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'all' ? 'bg-white text-teal-800 font-bold shadow-xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('hemodynamics')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'hemodynamics' ? 'bg-white text-teal-800 font-bold shadow-xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Hemodinamik
          </button>
          <button
            onClick={() => setActiveTab('lipid')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'lipid' ? 'bg-white text-teal-800 font-bold shadow-xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Lipid
          </button>
          <button
            onClick={() => setActiveTab('metabolic')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'metabolic' ? 'bg-white text-teal-800 font-bold shadow-xs border border-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Metabolik
          </button>
        </div>
      </div>

      {/* Flagged clinical risks summary */}
      {flags.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <span>Temuan Klinis Kritis & Peringatan Ambang Batas (Tahun Terakhir):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {flags.map((flag, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 ${
                  flag.level === 'critical' 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {flag.level === 'critical' ? (
                    <span className="h-2 w-2 rounded-full bg-rose-600 block animate-pulse" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-600 block" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs">{flag.label}</div>
                  <div className="text-xs opacity-90 leading-tight mt-0.5">{flag.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-xs">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr className="text-stone-600 font-bold uppercase text-xs tracking-wider">
              <th className="py-3 px-3">Parameter Klinis / Biomarker</th>
              <th className="py-3 px-3">Batas Rujukan Normal</th>
              {sortedRecords.map((r, i) => (
                <th key={r.id || i} className="py-3 px-3 text-right">
                  MCU {new Date(r.examinationDate).getFullYear()}
                </th>
              ))}
              {previous && <th className="py-3 px-3 text-right">Delta (Th Terakhir)</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono bg-white">
            
            {/* --- HEMODINAMIKA --- */}
            {(activeTab === 'all' || activeTab === 'hemodynamics') && (
              <>
                <tr className="bg-stone-100/90 font-sans font-bold text-stone-900 text-xs border-y border-stone-200 tracking-wider">
                  <td colSpan={2 + sortedRecords.length + (previous ? 1 : 0)} className="py-2.5 px-3">
                    KARDIOVASKULAR & HEMODINAMIKA
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Tekanan Darah Sistolik</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;120 mmHg</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right font-bold ${r.systolicBp >= 140 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {r.systolicBp} mmHg
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.systolicBp, previous.systolicBp, 'mmHg', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Tekanan Darah Diastolik</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;80 mmHg</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right font-bold ${r.diastolicBp >= 90 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {r.diastolicBp} mmHg
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.diastolicBp, previous.diastolicBp, 'mmHg', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Pulse Pressure (Tekanan Nadi)</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;60 mmHg</td>
                  {sortedRecords.map((r, i) => {
                    const pp = getPulsePressure(r.systolicBp, r.diastolicBp);
                    return (
                      <td key={i} className={`py-2.5 px-3 text-right ${pp >= 60 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                        {pp} mmHg
                      </td>
                    );
                  })}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(
                        getPulsePressure(latest.systolicBp, latest.diastolicBp),
                        getPulsePressure(previous.systolicBp, previous.diastolicBp),
                        'mmHg',
                        true
                      )}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Mean Arterial Pressure (MAP)</td>
                  <td className="py-2.5 px-3 text-slate-500">70–100 mmHg</td>
                  {sortedRecords.map((r, i) => {
                    const map = getMap(r.systolicBp, r.diastolicBp);
                    return (
                      <td key={i} className="py-2.5 px-3 text-right text-slate-700">
                        {map} mmHg
                      </td>
                    );
                  })}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(
                        getMap(latest.systolicBp, latest.diastolicBp),
                        getMap(previous.systolicBp, previous.diastolicBp),
                        'mmHg',
                        true
                      )}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Denyut Jantung Istirahat (RHR)</td>
                  <td className="py-2.5 px-3 text-slate-500">60–100 bpm</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right text-slate-700">
                      {r.restingHeartRate} bpm
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.restingHeartRate, previous.restingHeartRate, 'bpm', true)}
                    </td>
                  )}
                </tr>
              </>
            )}

            {/* --- PROFIL LIPID --- */}
            {(activeTab === 'all' || activeTab === 'lipid') && (
              <>
                <tr className="bg-stone-100/90 font-sans font-bold text-stone-900 text-xs border-y border-stone-200 tracking-wider">
                  <td colSpan={2 + sortedRecords.length + (previous ? 1 : 0)} className="py-2.5 px-3">
                    PROFIL LIPID & FRAKSI KOLESTEROL
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Kolesterol Total</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;200 mg/dL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.totalCholesterolMgdl >= 240 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {r.totalCholesterolMgdl} mg/dL
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.totalCholesterolMgdl, previous.totalCholesterolMgdl, 'mg/dL', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">LDL-Kolesterol</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;100 mg/dL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.ldlCholesterolMgdl >= 160 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {r.ldlCholesterolMgdl} mg/dL
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.ldlCholesterolMgdl, previous.ldlCholesterolMgdl, 'mg/dL', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">HDL-Kolesterol</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt;40 (L) / &gt;50 (P) mg/dL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.hdlCholesterolMgdl < 40 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                      {r.hdlCholesterolMgdl} mg/dL
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.hdlCholesterolMgdl, previous.hdlCholesterolMgdl, 'mg/dL', false)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Trigliserida</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;150 mg/dL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.triglyceridesMgdl >= 200 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                      {r.triglyceridesMgdl} mg/dL
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.triglyceridesMgdl, previous.triglyceridesMgdl, 'mg/dL', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Rasio TG/HDL</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;3.0</td>
                  {sortedRecords.map((r, i) => {
                    const ratio = getTgHdlRatio(r.triglyceridesMgdl, r.hdlCholesterolMgdl);
                    return (
                      <td key={i} className={`py-2.5 px-3 text-right ${ratio >= 3.0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {ratio}
                      </td>
                    );
                  })}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(
                        getTgHdlRatio(latest.triglyceridesMgdl, latest.hdlCholesterolMgdl),
                        getTgHdlRatio(previous.triglyceridesMgdl, previous.hdlCholesterolMgdl),
                        '',
                        true
                      )}
                    </td>
                  )}
                </tr>
              </>
            )}

            {/* --- METABOLIK & GINJAL --- */}
            {(activeTab === 'all' || activeTab === 'metabolic') && (
              <>
                <tr className="bg-stone-100/90 font-sans font-bold text-stone-900 text-xs border-y border-stone-200 tracking-wider">
                  <td colSpan={2 + sortedRecords.length + (previous ? 1 : 0)} className="py-2.5 px-3">
                    METABOLIK, GLIKEMIK & FUNGSI GINJAL
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Gula Darah Puasa (GDP)</td>
                  <td className="py-2.5 px-3 text-slate-500">70–99 mg/dL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.fastingGlucoseMgdl >= 126 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {r.fastingGlucoseMgdl} mg/dL
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.fastingGlucoseMgdl, previous.fastingGlucoseMgdl, 'mg/dL', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">HbA1c</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;5.7%</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right text-slate-700">
                      {r.hba1cPercent ? `${r.hba1cPercent}%` : '-'}
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.hba1cPercent, previous.hba1cPercent, '%', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Indeks Massa Tubuh (IMT / BMI)</td>
                  <td className="py-2.5 px-3 text-slate-500">18.5–22.9 kg/m²</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className={`py-2.5 px-3 text-right ${r.bmi >= 25.0 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                      {r.bmi} kg/m²
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.bmi, previous.bmi, '', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">Lingkar Pinggang</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt;90 (Pria) / &lt;80 (Wanita) cm</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right text-slate-700">
                      {r.waistCircumferenceCm ? `${r.waistCircumferenceCm} cm` : '-'}
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.waistCircumferenceCm, previous.waistCircumferenceCm, 'cm', true)}
                    </td>
                  )}
                </tr>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">eGFR (Laju Filtrasi Glomerulus)</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt;90 mL/min/1.73m²</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right text-slate-700">
                      {r.egfr ? `${r.egfr}` : '-'}
                    </td>
                  ))}
                  {previous && (
                    <td className="py-2.5 px-3 text-right">
                      {getDeltaBadge(latest.egfr, previous.egfr, '', false)}
                    </td>
                  )}
                </tr>
              </>
            )}

            {/* --- EKG & KEPUTUSAN KLINIS --- */}
            {activeTab === 'all' && (
              <>
                <tr className="bg-stone-100/90 font-sans font-bold text-stone-900 text-xs border-y border-stone-200 tracking-wider">
                  <td colSpan={2 + sortedRecords.length + (previous ? 1 : 0)} className="py-2.5 px-3">
                    DIAGNOSTIK EKG & FIT-FOR-WORK
                  </td>
                </tr>
                <tr className="hover:bg-stone-50/60 transition">
                  <td className="py-2.5 px-3 font-sans text-stone-800 font-medium">Interpretasi EKG Istirahat</td>
                  <td className="py-2.5 px-3 text-stone-500">NORMAL</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        r.restingEcgInterpretation === 'NORMAL' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {r.restingEcgInterpretation}
                      </span>
                    </td>
                  ))}
                  {previous && <td className="py-2.5 px-3 text-right text-stone-400">-</td>}
                </tr>
                <tr className="hover:bg-stone-50/60 transition">
                  <td className="py-2.5 px-3 font-sans text-stone-800 font-medium">Keputusan Kelayakan Kerja (Fit Status)</td>
                  <td className="py-2.5 px-3 text-stone-500">FIT</td>
                  {sortedRecords.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        r.overallFitnessStatus === 'FIT' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : r.overallFitnessStatus === 'FIT_WITH_RESTRICTION'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {r.overallFitnessStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                  {previous && <td className="py-2.5 px-3 text-right text-stone-400">-</td>}
                </tr>
              </>
            )}

          </tbody>
        </table>
      </div>

    </div>
  );
}
