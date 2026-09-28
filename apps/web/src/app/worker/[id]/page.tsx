'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UserCheck, 
  AlertCircle, 
  FileText, 
  Stethoscope, 
  Lock, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { getDemoWorker, DEMO_WORKERS } from '@/lib/demoData';
import { WorkerProfileHeader } from '@/components/WorkerProfileHeader';
import { ClinicalScoreCard } from '@/components/ClinicalScoreCard';
import { Layer2MlScoreCard } from '@/components/Layer2MlScoreCard';
import { Layer3DlScoreCard } from '@/components/Layer3DlScoreCard';
import { McuLongitudinalComparison } from '@/components/McuLongitudinalComparison';
import { DcuTrendChart } from '@/components/DcuTrendChart';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { DailyAlertBanner } from '@/components/DailyAlertBanner';
import { DailyAlert } from '@/lib/alerts/alertEngine';
import { calculateFraminghamCvd } from '@cardiowork/shared';

interface WorkerDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const router = useRouter();
  const workerData = getDemoWorker(params.id);
  const { worker, mcuRecords, dcuRecords } = workerData;
  const [alerts, setAlerts] = useState<DailyAlert[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadAlerts() {
      try {
        const res = await fetch(`/api/alerts/daily?workerId=${worker.pseudonymId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAlerts(data.alerts || []);
          }
        }
      } catch (err) {
        console.error('Failed to load worker alerts:', err);
      }
    }
    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, [worker.pseudonymId]);

  // Latest MCU record for baseline inputs
  const latestMcu = mcuRecords[mcuRecords.length - 1];

  // DCU metrics for ML/DL models
  const dcuMeanSbp = dcuRecords.length > 0 
    ? Math.round(dcuRecords.reduce((acc, c) => acc + c.systolicBp, 0) / dcuRecords.length) 
    : (latestMcu?.systolicBp || 120);

  const dcuStdSbp = dcuRecords.length > 1
    ? Math.round(Math.sqrt(dcuRecords.reduce((acc, c) => acc + Math.pow(c.systolicBp - dcuMeanSbp, 2), 0) / dcuRecords.length) * 10) / 10
    : 4.5;

  const dcuHypertensiveDays = dcuRecords.filter(r => r.systolicBp >= 140 || r.diastolicBp >= 90).length;
  const dcuSymptomDays = dcuRecords.filter(r => r.chestPainFlag || r.shortnessOfBreathFlag || r.dizzinessFlag || r.palpitationsFlag).length;

  const framinghamRisk = latestMcu ? calculateFraminghamCvd({
    age: worker.age,
    gender: worker.gender,
    systolicBp: latestMcu.systolicBp,
    isTreatedForHypertension: latestMcu.onAntihypertensiveDrugs,
    totalCholesterolMgdl: latestMcu.totalCholesterolMgdl,
    hdlCholesterolMgdl: latestMcu.hdlCholesterolMgdl,
    isSmoker: latestMcu.smokingStatus === 'ACTIVE_SMOKER',
    hasDiabetes: latestMcu.hasDiabetesHistory
  }).riskPercent10Yr : 0;

  const handleArchetypeSwitch = (targetId: string) => {
    router.push(`/worker/${targetId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Archetype Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        
        {/* Breadcrumb / Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs text-slate-600 hover:text-sky-600 transition font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        {/* Quick Demo Worker Archetypes */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Demo Sampel:</span>
          
          <button
            onClick={() => handleArchetypeSwitch('W-00192')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              worker.pseudonymId === 'W-00192'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🟢 W-00192 (Risiko Rendah / Fit)
          </button>

          <button
            onClick={() => handleArchetypeSwitch('W-00189')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              worker.pseudonymId === 'W-00189'
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🟡 W-00189 (Risiko Sedang / Borderline)
          </button>

          <button
            onClick={() => handleArchetypeSwitch('W-00190')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              worker.pseudonymId === 'W-00190'
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🔴 W-00190 (Risiko Tinggi / Unfit)
          </button>

          <Link
            href="/kiosk"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5 ml-auto sm:ml-0 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Skrining DCU Kiosk</span>
          </Link>
        </div>

      </div>

      {/* 1. Worker Profile Identity Header */}
      <WorkerProfileHeader 
        pseudonymId={worker.pseudonymId}
        department={worker.department}
        jobTitle={worker.jobTitle}
        shiftPattern={worker.shiftPattern}
        tenureMonths={worker.tenureMonths}
        gender={worker.gender}
        age={worker.age}
        overallFitness={latestMcu?.overallFitnessStatus || 'FIT'}
      />

      {/* Real-Time Daily Alert Banner (EWS Engine) */}
      <DailyAlertBanner alerts={alerts} />

      {/* 2. Layer 1 Clinical Scores Comparison Card */}
      {latestMcu && (
        <ClinicalScoreCard 
          age={worker.age}
          gender={worker.gender}
          systolicBp={latestMcu.systolicBp}
          isTreatedBp={latestMcu.onAntihypertensiveDrugs}
          totalCholesterol={latestMcu.totalCholesterolMgdl}
          hdlCholesterol={latestMcu.hdlCholesterolMgdl}
          isSmoker={latestMcu.smokingStatus === 'ACTIVE_SMOKER'}
          hasDiabetes={latestMcu.hasDiabetesHistory}
        />
      )}

      {/* 2b. Layer 2 Calibrated Machine Learning Baseline (LightGBM) */}
      {latestMcu && (
        <Layer2MlScoreCard 
          systolicBp={latestMcu.systolicBp}
          ldlCholesterol={latestMcu.ldlCholesterolMgdl}
          totalCholesterol={latestMcu.totalCholesterolMgdl}
          isSmoker={latestMcu.smokingStatus === 'ACTIVE_SMOKER'}
          age={worker.age}
          tenureMonths={worker.tenureMonths}
          dcuMeanSbp={
            dcuRecords.length > 0 
              ? Math.round(dcuRecords.reduce((acc, c) => acc + c.systolicBp, 0) / dcuRecords.length) 
              : latestMcu.systolicBp
          }
          framinghamRiskPercent={framinghamRisk}
        />
      )}

      {/* 2c. Layer 3 PyTorch Deep Learning & Multimodal Fusion (GRU-D + MC Dropout) */}
      {latestMcu && (
        <Layer3DlScoreCard 
          systolicBp={latestMcu.systolicBp}
          diastolicBp={latestMcu.diastolicBp}
          totalCholesterol={latestMcu.totalCholesterolMgdl}
          ldlCholesterol={latestMcu.ldlCholesterolMgdl}
          fastingGlucose={latestMcu.fastingGlucoseMgdl}
          isSmoker={latestMcu.smokingStatus === 'ACTIVE_SMOKER'}
          age={worker.age}
          dcuMeanSbp={dcuMeanSbp}
          dcuStdSbp={dcuStdSbp}
          dcuHypertensiveDays={dcuHypertensiveDays}
          dcuSymptomDays={dcuSymptomDays}
          layer1FraminghamPercent={framinghamRisk}
          layer2LgbmPercent={Math.min(99, Math.max(1, Math.round((1.0 / (1.0 + Math.exp(-(-6.2 + (latestMcu.systolicBp - 120) * 0.075 + (latestMcu.ldlCholesterolMgdl - 100) * 0.032 + (latestMcu.smokingStatus === 'ACTIVE_SMOKER' ? 1.45 : 0) + (worker.age - 40) * 0.045 + (dcuMeanSbp - 120) * 0.055)))) * 1000) / 10))}
        />
      )}

      {/* 3. What-If Risk Simulator (Interactive Lifestyle & Therapy) */}
      {latestMcu && (
        <WhatIfSimulator 
          age={worker.age}
          gender={worker.gender}
          systolicBp={latestMcu.systolicBp}
          isTreatedBp={latestMcu.onAntihypertensiveDrugs}
          totalCholesterol={latestMcu.totalCholesterolMgdl}
          hdlCholesterol={latestMcu.hdlCholesterolMgdl}
          isSmoker={latestMcu.smokingStatus === 'ACTIVE_SMOKER'}
          hasDiabetes={latestMcu.hasDiabetesHistory}
        />
      )}

      {/* 4. MCU Longitudinal 3-Year Comparison Table */}
      <McuLongitudinalComparison records={mcuRecords} />

      {/* 5. DCU 30-Day Hemodynamic Trend Chart */}
      <DcuTrendChart records={dcuRecords} />

      {/* 6. Clinical Governance & Action Footer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Tindakan Klinis & Alur Kerja Dokter Perusahaan (CDSS Workflow)
              </h3>
              <p className="text-xs text-slate-500">Protokol pengambilan keputusan medis terstandar untuk dokter okupasi.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Kepatuhan Rekam Medis Elektronik (Permenkes No. 24/2022)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => alert(`Rujukan medis untuk pekerja ${worker.pseudonymId} telah disiapkan ke RS rujukan terdekat.`)}
            className="flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Eskalasi ke Dokter Sp.Ok / Kardiolog</span>
          </button>

          <button
            onClick={() => alert(`Konsultasi nutrisi dan gaya hidup K3 dijadwalkan untuk ${worker.pseudonymId}.`)}
            className="flex items-center justify-center space-x-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <FileText className="h-4 w-4" />
            <span>Jadwalkan Konseling Gaya Hidup K3</span>
          </button>

          <Link
            href={`/reports/view/${worker.pseudonymId}`}
            className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Resume Rekomendasi (PDF)</span>
          </Link>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
          <div>
            ID Pekerja: <span className="font-mono font-semibold text-slate-700">{worker.pseudonymId}</span> • 
            Hash Integritas: <span className="font-mono text-slate-500">sha256:7f8a9e...</span>
          </div>
          <div>
            Status Akses: <span className="text-emerald-700 font-semibold">Tercatat di Audit Log</span>
          </div>
        </div>
      </div>

    </div>
  );
}
