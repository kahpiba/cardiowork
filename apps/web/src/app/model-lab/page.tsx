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
  Zap
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Model Lab & Tata Kelola AI (Explainable AI)
                </h1>
                <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  SHAP Interpretability
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Transparansi klinis, evaluasi metrik kalibrasi 4 model, dan analisis atribusi lokal SHAP individual.
              </p>
            </div>
          </div>

          <Link
            href="/population"
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Kesehatan Populasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('SHAP_WATERFALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SHAP_WATERFALL'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            1. SHAP Waterfall Individu (Local Explainability)
          </button>

          <button
            onClick={() => setActiveTab('GLOBAL_IMPORTANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'GLOBAL_IMPORTANCE'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            2. Kepentingan Fitur Global (Global Feature Importance)
          </button>

          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'COMPARISON'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
              Pilih Profil Pekerja untuk Analisis SHAP:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(DEMO_WORKERS).map((d) => {
                const isSelected = selectedWorkerId === d.worker.pseudonymId;
                return (
                  <button
                    key={d.worker.pseudonymId}
                    onClick={() => setSelectedWorkerId(d.worker.pseudonymId)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {d.worker.pseudonymId}
                      </span>
                      <span className="text-[10px] text-zinc-400">{d.worker.age} th</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-200 mt-1 truncate">
                      {d.worker.nameSynthetic}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {d.worker.jobTitle} • {d.worker.department}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Waterfall Component */}
          {loadingShap || !shapData ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
              Menghitung kontribusi lokal Shapley Additive Explanations...
            </div>
          ) : (
            <ShapWaterfallChart data={shapData} />
          )}

        </div>
      )}

      {/* Tab 2 Content: Global Feature Importance */}
      {activeTab === 'GLOBAL_IMPORTANCE' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Peringkat Kepentingan Fitur Global (LightGBM Split Importance)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Menunjukkan variabel klinis dan deret waktu harian yang paling sering dijadikan titik percabangan (*decision split*) pada pohon ensemble.
              </p>
            </div>
            <span className="text-xs font-mono bg-zinc-800 px-2.5 py-1 rounded text-zinc-300">
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
                <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis dataKey="label" type="category" tick={{ fill: '#d4d4d8', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Bobot Split`, 'Tingkat Kepentingan']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {globalImportanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#ef4444' : index < 4 ? '#f59e0b' : index < 8 ? '#6366f1' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
            <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
              <strong className="text-rose-400 block mb-1">1. Dominasi Hemodinamik</strong>
              Tensi sistolik MCU (196 split) dan MAP (75 split) adalah prediktor dominan mutlak dari pemburukan vaskular.
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
              <strong className="text-indigo-400 block mb-1">2. Kontribusi DCU Harian</strong>
              Rata-rata tensi harian 30-hari (51) dan kemiringan slope 7-hari (34) berhasil masuk peringkat top 10, membuktikan nilai tambah DCU.
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
              <strong className="text-emerald-400 block mb-1">3. Faktor Gaya Hidup & Okupasi</strong>
              Merokok aktif (71) dan masa kerja shift (59) memiliki impak signifikan terhadap progresi plak koroner.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Model Performance Comparison */}
      {activeTab === 'COMPARISON' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Komparasi Metrik Evaluasi & Kalibrasi Silang 5-Fold
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Diuji secara independen pada 1.000 pekerja dengan 5-Fold Stratified Cross-Validation dan validasi paritas ONNX Serverless.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead className="bg-zinc-950/80 text-[11px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">Model</th>
                  <th className="p-3">Tipe Algoritma</th>
                  <th className="p-3 text-right text-indigo-400">ROC-AUC</th>
                  <th className="p-3 text-right text-cyan-400">PR-AUC</th>
                  <th className="p-3 text-right text-emerald-400">Brier Score</th>
                  <th className="p-3 text-right text-rose-400">Recall</th>
                  <th className="p-3 text-right">ECE</th>
                  <th className="p-3 text-right">Ukuran</th>
                  <th className="p-3 text-right">Latensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {modelComparisons.map((m) => (
                  <tr key={m.name} className={`hover:bg-zinc-800/30 transition-colors ${m.isChampion ? 'bg-rose-950/10' : ''}`}>
                    <td className="p-3 font-sans font-bold text-white whitespace-nowrap flex items-center gap-1.5">
                      {m.isChampion && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span>{m.name}</span>
                    </td>
                    <td className="p-3 font-sans text-zinc-400">{m.type}</td>
                    <td className="p-3 text-right font-bold text-indigo-300">{mAucFormat(m.rocAuc)}</td>
                    <td className="p-3 text-right text-cyan-300">{m.prAuc}</td>
                    <td className="p-3 text-right font-bold text-emerald-300">{m.brierScore}</td>
                    <td className="p-3 text-right font-bold text-rose-300">{m.recall}</td>
                    <td className="p-3 text-right text-zinc-400">{m.ece}</td>
                    <td className="p-3 text-right text-zinc-300">{m.modelSize}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{m.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Justifikasi Pemilihan Model Champion untuk Lingkungan Klinis K3:
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>
                <strong>LightGBM (Layer 2 Tabular Champion):</strong> Terpilih karena memiliki <em>Brier Score</em> terkecil (0.0050) yang menandakan probabilitas risiko sangat terkalibrasi secara matematis, serta menangkap 98.83% pekerja berisiko tinggi (*Recall*) dalam ukuran berkas ONNX yang sangat ringkas (59.7 KB).
              </li>
              <li>
                <strong>MultimodalCardioFusionNet (Layer 3 Deep Learning):</strong> Mengintegrasikan kapabilitas <em>Multi-Task Learning</em> (memprediksi kejadian kardiovaskular 10-tahun sekaligus risiko Medevac 1-tahun) dan estimasi ketidakpastian <em>Monte Carlo Dropout (95% CI)</em>, krusial saat menangani kasus ambang batas (*borderline*).
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}

function mAucFormat(auc: string) {
  return auc;
}
