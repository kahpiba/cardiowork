'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  GitCompare, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Award, 
  Info, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { ShapWaterfallChart } from '@/components/ShapWaterfallChart';
import { calculateWorkerShap, ShapExplanationResult } from '@/lib/shap/shapExplainer';
import { DEMO_WORKERS } from '@/lib/demoData';

export default function ModelLabPage() {
  const [activeTab, setActiveTab] = useState<'COMPARISON' | 'GLOBAL_IMPORTANCE' | 'SHAP_WATERFALL'>('SHAP_WATERFALL');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('W-00192');
  const [shapData, setShapData] = useState<ShapExplanationResult | null>(null);
  const [loadingShap, setLoadingShap] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadShap() {
      setLoadingShap(true);
      try {
        const res = await calculateWorkerShap(selectedWorkerId);
        if (isMounted) setShapData(res);
      } catch (err) {
        console.error('Failed to load SHAP values:', err);
      } finally {
        if (isMounted) setLoadingShap(false);
      }
    }
    loadShap();
    return () => { isMounted = false; };
  }, [selectedWorkerId]);

  // Model comparison table data
  const modelComparisons = [
    {
      name: 'LightGBM Classifier (Champion)',
      type: 'Gradient Boosted Decision Trees',
      isChampion: true,
      rocAuc: '0.9998',
      prAuc: '0.9997',
      brierScore: '0.0050',
      recall: '98.83%',
      ece: '0.0161',
      modelSize: '59.7 KB',
      latency: '< 2 ms',
      verdict: 'Champion Tabular ML — Kalibrasi Brier score terbaik (0.0050) & sensitivitas klinis tertinggi'
    },
    {
      name: 'XGBoost Classifier',
      type: 'Extreme Gradient Boosting',
      isChampion: false,
      rocAuc: '0.9993',
      prAuc: '0.9992',
      brierScore: '0.0053',
      recall: '98.83%',
      ece: '0.0103',
      modelSize: '68.4 KB',
      latency: '< 2 ms',
      verdict: 'Runner-up — Kinerja sangat kompetitif dengan kalibrasi ECE terbaik'
    },
    {
      name: 'Random Forest Classifier',
      type: 'Ensemble Bagging Trees',
      isChampion: false,
      rocAuc: '0.9970',
      prAuc: '0.9960',
      brierScore: '0.0225',
      recall: '95.57%',
      ece: '0.0175',
      modelSize: '412.0 KB',
      latency: '< 4 ms',
      verdict: 'Baseline Stabil — Akurasi tinggi namun ukuran model lebih besar'
    },
    {
      name: 'MultimodalCardioFusionNet',
      type: 'PyTorch Bi-GRU-D + Tabular MLP',
      isChampion: true,
      rocAuc: '0.9882',
      prAuc: '0.9865',
      brierScore: '0.0439',
      recall: '91.01%',
      ece: '0.0240',
      modelSize: '1.1 MB',
      latency: '< 6 ms',
      verdict: 'Champion Deep Learning — Multi-Task (10-Yr CVD + 1-Yr Medevac) + MC Dropout Uncertainty (95% CI)'
    }
  ];

  // Top 12 global feature importance
  const globalImportanceData = [
    { feature: 'systolic_bp', label: 'Tensi Sistolik MCU', importance: 196, category: 'Hemodinamik' },
    { feature: 'ldl_cholesterol_mgdl', label: 'LDL-Kolesterol', importance: 92, category: 'Lipid' },
    { feature: 'map', label: 'Mean Arterial Pressure (MAP)', importance: 75, category: 'Hemodinamik' },
    { feature: 'total_cholesterol_mgdl', label: 'Kolesterol Total', importance: 74, category: 'Lipid' },
    { feature: 'is_smoker', label: 'Status Merokok Aktif', importance: 71, category: 'Gaya Hidup' },
    { feature: 'tenure_months', label: 'Masa Kerja Kru', importance: 59, category: 'Okupasi' },
    { feature: 'dcu_mean_sbp_30d', label: 'Rata-rata Tensi DCU (30-Hari)', importance: 51, category: 'DCU Harian' },
    { feature: 'diastolic_bp', label: 'Tensi Diastolik MCU', importance: 36, category: 'Hemodinamik' },
    { feature: 'dcu_slope_sbp_7d', label: 'Tren Kemiringan Tensi DCU (7-Hari)', importance: 34, category: 'DCU Harian' },
    { feature: 'age', label: 'Usia Kronologis', importance: 17, category: 'Demografis' },
    { feature: 'has_hypertension_history', label: 'Riwayat Hipertensi', importance: 10, category: 'Anamnesis' },
    { feature: 'hba1c_percent', label: 'HbA1c Glikasi', importance: 9, category: 'Metabolik' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto bg-medical-grid">
      
      {/* Top back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Model Lab & Tata Kelola AI (Explainable AI)
                </h1>
                <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                  SHAP Interpretability
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Transparansi klinis, evaluasi metrik kalibrasi 4 model, dan analisis atribusi lokal SHAP individual.
              </p>
            </div>
          </div>

          <Link
            href="/population"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <span>Kesehatan Populasi</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('SHAP_WATERFALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'SHAP_WATERFALL'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            1. SHAP Waterfall Individu (Local Explainability)
          </button>

          <button
            onClick={() => setActiveTab('GLOBAL_IMPORTANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'GLOBAL_IMPORTANCE'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            2. Kepentingan Fitur Global (Global Feature Importance)
          </button>

          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'COMPARISON'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            3. Evaluasi Metrik & Kalibrasi Model
          </button>
        </div>
      </div>

      {/* Tab 1 Content: SHAP Waterfall */}
      {activeTab === 'SHAP_WATERFALL' && (
        <div className="space-y-6">
          
          {/* Worker Selector Pills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Pilih Profil Pekerja untuk Analisis SHAP:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(DEMO_WORKERS).map((d) => {
                const isSelected = selectedWorkerId === d.worker.pseudonymId;
                return (
                  <button
                    key={d.worker.pseudonymId}
                    onClick={() => setSelectedWorkerId(d.worker.pseudonymId)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 shadow-xs ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-700">
                        {d.worker.pseudonymId}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{d.worker.age} th • {d.worker.gender === 'MALE' ? 'Pria' : 'Wanita'}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {d.worker.nameSynthetic}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      {d.worker.jobTitle} • {d.worker.department}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Waterfall Component */}
          {loadingShap || !shapData ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
              <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
              Menghitung kontribusi lokal Shapley Additive Explanations...
            </div>
          ) : (
            <ShapWaterfallChart data={shapData} />
          )}

        </div>
      )}

      {/* Tab 2 Content: Global Feature Importance */}
      {activeTab === 'GLOBAL_IMPORTANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                Peringkat Kepentingan Fitur Global (LightGBM Split Importance)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Menunjukkan variabel klinis dan deret waktu harian yang paling sering dijadikan titik percabangan (*decision split*) pada pohon ensemble.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 font-bold border border-slate-200">
              N = 42 Fitur
            </span>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={globalImportanceData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="label" type="category" tick={{ fill: '#334155', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Bobot Split`, 'Tingkat Kepentingan']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {globalImportanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#ef4444' : index < 4 ? '#f59e0b' : index < 8 ? '#0284c7' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-rose-700 block mb-1 font-bold">1. Dominasi Hemodinamik</strong>
              Tensi sistolik MCU (196 split) dan MAP (75 split) adalah prediktor dominan mutlak dari pemburukan vaskular.
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-sky-700 block mb-1 font-bold">2. Kontribusi DCU Harian</strong>
              Rata-rata tensi harian 30-hari (51) dan kemiringan slope 7-hari (34) berhasil masuk peringkat top 10, membuktikan nilai tambah DCU.
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-emerald-700 block mb-1 font-bold">3. Faktor Gaya Hidup & Okupasi</strong>
              Merokok aktif (71) dan masa kerja shift (59) memiliki impak signifikan terhadap progresi plak koroner.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Model Performance Comparison */}
      {activeTab === 'COMPARISON' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Komparasi Metrik Evaluasi & Kalibrasi Silang 5-Fold
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diuji secara independen pada 1.000 pekerja dengan 5-Fold Stratified Cross-Validation dan validasi paritas ONNX Serverless.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Model</th>
                  <th className="p-3">Tipe Algoritma</th>
                  <th className="p-3 text-right text-indigo-700">ROC-AUC</th>
                  <th className="p-3 text-right text-sky-700">PR-AUC</th>
                  <th className="p-3 text-right text-emerald-700">Brier Score</th>
                  <th className="p-3 text-right text-rose-700">Recall</th>
                  <th className="p-3 text-right">ECE</th>
                  <th className="p-3 text-right">Ukuran</th>
                  <th className="p-3 text-right">Latensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono bg-white">
                {modelComparisons.map((m) => (
                  <tr key={m.name} className={`hover:bg-slate-50/80 transition-colors ${m.isChampion ? 'bg-sky-50/40' : ''}`}>
                    <td className="p-3 font-sans font-bold text-slate-900 whitespace-nowrap flex items-center gap-1.5">
                      {m.isChampion && <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span>{m.name}</span>
                    </td>
                    <td className="p-3 font-sans text-slate-500">{m.type}</td>
                    <td className="p-3 text-right font-bold text-indigo-700">{m.rocAuc}</td>
                    <td className="p-3 text-right text-sky-700 font-bold">{m.prAuc}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{m.brierScore}</td>
                    <td className="p-3 text-right font-bold text-rose-700">{m.recall}</td>
                    <td className="p-3 text-right text-slate-500">{m.ece}</td>
                    <td className="p-3 text-right text-slate-600">{m.modelSize}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{m.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Justifikasi Pemilihan Model Champion untuk Lingkungan Klinis K3:
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <li>
                <strong className="text-slate-800">LightGBM (Layer 2 Tabular Champion):</strong> Terpilih karena memiliki <em>Brier Score</em> terkecil (0.0050) yang menandakan probabilitas risiko sangat terkalibrasi secara matematis, serta menangkap 98.83% pekerja berisiko tinggi (*Recall*) dalam ukuran berkas ONNX yang sangat ringkas (59.7 KB).
              </li>
              <li>
                <strong className="text-slate-800">MultimodalCardioFusionNet (Layer 3 Deep Learning):</strong> Mengintegrasikan kapabilitas <em>Multi-Task Learning</em> (memprediksi kejadian kardiovaskular 10-tahun sekaligus risiko Medevac 1-tahun) dan estimasi ketidakpastian <em>Monte Carlo Dropout (95% CI)</em>, krusial saat menangani kasus ambang batas (*borderline*).
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
