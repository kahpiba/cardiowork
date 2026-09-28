'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Moon, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  Stethoscope,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { DEMO_WORKERS } from '@/lib/demoData';

interface TriageResult {
  dailyFitnessVerdict: 'FIT' | 'FIT_WITH_RESTRICTION' | 'UNFIT';
  verdictIndonesian: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  triageSummary: string;
  triageRecommendations: string[];
  alerts: any[];
  inferenceSnapshot: {
    layer1Tier: string;
    layer2Probability: number;
    layer3Probability: number;
    medevacRisk: number;
    autoencoderMse: number;
    isAnomaly: boolean;
  };
}

export default function DcuKioskPage() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('W-00192');
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [sleepHours, setSleepHours] = useState<number>(7.0);

  // Symptoms
  const [chestPain, setChestPain] = useState<boolean>(false);
  const [dyspnea, setDyspnea] = useState<boolean>(false);
  const [dizziness, setDizziness] = useState<boolean>(false);
  const [palpitations, setPalpitations] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  // Presets
  const applyPreset = (preset: 'NORMAL' | 'ELEVATED' | 'CRITICAL') => {
    if (preset === 'NORMAL') {
      setSystolicBp(118);
      setDiastolicBp(76);
      setHeartRate(70);
      setSpo2(98);
      setTemperature(36.5);
      setSleepHours(7.5);
      setChestPain(false);
      setDyspnea(false);
      setDizziness(false);
      setPalpitations(false);
    } else if (preset === 'ELEVATED') {
      setSystolicBp(144);
      setDiastolicBp(92);
      setHeartRate(88);
      setSpo2(96);
      setTemperature(36.8);
      setSleepHours(4.5);
      setChestPain(false);
      setDyspnea(false);
      setDizziness(true);
      setPalpitations(false);
    } else if (preset === 'CRITICAL') {
      setSystolicBp(178);
      setDiastolicBp(106);
      setHeartRate(104);
      setSpo2(91);
      setTemperature(37.4);
      setSleepHours(3.5);
      setChestPain(true);
      setDyspnea(true);
      setDizziness(true);
      setPalpitations(true);
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        workerId: selectedWorkerId,
        systolicBp,
        diastolicBp,
        restingHeartRate: heartRate,
        spo2Percent: spo2,
        bodyTemperatureC: temperature,
        sleepHoursLast24h: sleepHours,
        chestPainFlag: chestPain,
        shortnessOfBreathFlag: dyspnea,
        dizzinessFlag: dizziness,
        palpitationsFlag: palpitations
      };

      const res = await fetch('/api/dcu/kiosk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Kiosk submit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentWorker = DEMO_WORKERS[selectedWorkerId]?.worker;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 bg-medical-grid">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb Back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Title & Guidance Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Terminal Skrining Mandiri Pre-Shift (DCU Kiosk)
                </h1>
                <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                  Self-Service POS K3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Pemeriksaan tanda vital mandiri bagi pekerja industri berisiko tinggi sebelum memulai shift kerja.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons for Demo */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Simulasi Cepat (Demo Presets):
            </span>
            <button
              type="button"
              onClick={() => applyPreset('NORMAL')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
            >
              🟢 Normal Sehat (118/76)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ELEVATED')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
            >
              🟡 Ambang Batas / Kelelahan (144/92)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('CRITICAL')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
            >
              🔴 Krisis Tensi & Nyeri Dada (178/106)
            </button>
          </div>
        </div>

        {/* Worker Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pilih ID Pekerja / Scan Kartu Badge:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(DEMO_WORKERS).map((demo) => {
              const isSelected = selectedWorkerId === demo.worker.pseudonymId;
              return (
                <button
                  key={demo.worker.pseudonymId}
                  type="button"
                  onClick={() => {
                    setSelectedWorkerId(demo.worker.pseudonymId);
                    setResult(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-500 shadow-xs ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-700">
                      {demo.worker.pseudonymId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{demo.worker.age} th • {demo.worker.gender === 'MALE' ? 'Pria' : 'Wanita'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {demo.worker.nameSynthetic}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {demo.worker.jobTitle} • {demo.worker.department}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Systolic BP */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Activity className="w-4 h-4 text-rose-600" />
                  Sistolik (SBP)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">mmHg</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min={80}
                  max={240}
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Normal: &lt;120 mmHg | Krisis: &ge;160
              </p>
            </div>

            {/* 2. Diastolic BP */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Activity className="w-4 h-4 text-rose-600" />
                  Diastolik (DBP)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">mmHg</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min={50}
                  max={140}
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Normal: &lt;80 mmHg | Krisis: &ge;100
              </p>
            </div>

            {/* 3. Heart Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Denyut Nadi (HR)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">bpm</span>
              </div>
              <input
                type="number"
                min={40}
                max={180}
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Normal: 60–99 bpm | Aritmia: &ge;100
              </p>
            </div>

            {/* 4. SpO2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Wind className="w-4 h-4 text-cyan-600" />
                  Saturasi Oksigen
                </span>
                <span className="text-[11px] text-slate-400 font-mono">% SpO2</span>
              </div>
              <input
                type="number"
                min={80}
                max={100}
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Optimal: 95–100% | Hipoksia: &lt;92%
              </p>
            </div>

            {/* 5. Temperature */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  Suhu Tubuh
                </span>
                <span className="text-[11px] text-slate-400 font-mono">°C</span>
              </div>
              <input
                type="number"
                step="0.1"
                min={34}
                max={42}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Normal: 36.1–37.2 °C | Demam: &ge;37.5
              </p>
            </div>

            {/* 6. Sleep Hours */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  Durasi Tidur 24 Jam
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Jam</span>
              </div>
              <input
                type="number"
                step="0.5"
                min={0}
                max={16}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-2xl font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Cukup: &ge;6.0 Jam | Fatik/Lelah: &lt;5.0
              </p>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Apakah Anda Merasakan Keluhan / Gejala Subjektif Berikut Saat Ini?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                chestPain 
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={chestPain}
                  onChange={(e) => setChestPain(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">Nyeri / Rasa Tertekan di Dada</span>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                dyspnea 
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={dyspnea}
                  onChange={(e) => setDyspnea(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">Sesak Napas (Dyspnea)</span>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                dizziness 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={dizziness}
                  onChange={(e) => setDizziness(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs">Pusing / Kliyengan</span>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                palpitations 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={palpitations}
                  onChange={(e) => setPalpitations(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs">Jantung Berdebar (Palpitasi)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm tracking-wide shadow-md shadow-sky-600/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mengevaluasi Tanda Vital & Model AI...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Kirim Data DCU & Dapatkan Status Kelayakan Shift
                </>
              )}
            </button>
          </div>
        </form>

        {/* Triage Verdict Modal / Result Card */}
        {result && (
          <div className={`border rounded-2xl p-6 sm:p-7 shadow-sm transition-all ${
            result.dailyFitnessVerdict === 'UNFIT'
              ? 'bg-rose-50/90 border-rose-300'
              : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
              ? 'bg-amber-50/90 border-amber-300'
              : 'bg-emerald-50/90 border-emerald-300'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-3.5">
                {result.dailyFitnessVerdict === 'UNFIT' ? (
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                    <ShieldAlert className="w-7 h-7 animate-pulse" />
                  </div>
                ) : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION' ? (
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Hasil Triase Skrining Mandiri
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {result.verdictIndonesian}
                  </h2>
                </div>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide self-start sm:self-auto shadow-xs ${
                result.dailyFitnessVerdict === 'UNFIT'
                  ? 'bg-rose-600 text-white'
                  : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {result.dailyFitnessVerdict}
              </span>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {result.triageSummary}
              </p>

              {/* Action items */}
              {result.triageRecommendations.length > 0 && (
                <div className="bg-white/80 rounded-xl p-4 border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-900">Instruksi Langsung K3:</span>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {result.triageRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Inference Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Layer 1 Klinis</div>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">
                    Tier {result.inferenceSnapshot.layer1Tier}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Layer 2 LightGBM</div>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">
                    {(result.inferenceSnapshot.layer2Probability * 100).toFixed(1)}% Risiko
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Layer 3 PyTorch DL</div>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">
                    {(result.inferenceSnapshot.layer3Probability * 100).toFixed(1)}% CVD
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Autoencoder Anomali</div>
                  <div className={`font-bold text-xs mt-0.5 ${result.inferenceSnapshot.isAnomaly ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {result.inferenceSnapshot.isAnomaly ? 'ANOMALI AKUT' : 'Normal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action link */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-mono">
                Pekerja: <strong className="text-slate-900">{currentWorker?.nameSynthetic}</strong> ({selectedWorkerId})
              </span>
              <Link
                href={`/worker/${selectedWorkerId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors"
              >
                Lihat Rekam Medis & Grafik DCU Lengkap
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
