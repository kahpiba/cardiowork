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
  ArrowLeft,
  Zap
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

  // Real-time boundary warning logic
  const isHighBp = systolicBp >= 140 || diastolicBp >= 90;
  const isCrisisBp = systolicBp >= 160 || diastolicBp >= 100;
  const isHypoxia = spo2 < 95;
  const hasCardiacSymptoms = chestPain || dyspnea || dizziness || palpitations;

  return (
    <div className="min-h-screen text-stone-900 py-8 px-4 sm:px-6 lg:px-8 bg-medical-grid">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb Back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-rose-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Title & Guidance Header */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-700 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                  Terminal Skrining Cepat Pre-Shift (DCU Kiosk)
                </h1>
                <span className="bg-rose-50 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-2xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-700" />
                  Kecepatan Alur &lt;30 Detik
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Pemeriksaan tanda vital mandiri bagi pekerja industri sebelum memulai rotasi shift kerja.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons for Demo */}
          <div className="mt-5 pt-4 border-t border-stone-200/60 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Simulasi Cepat (Demo Presets):
            </span>
            <button
              type="button"
              onClick={() => applyPreset('NORMAL')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 transition shadow-2xs"
            >
              🟢 Normal Sehat (118/76)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ELEVATED')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-2xs"
            >
              🟡 Ambang Batas / Fatik (144/92)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('CRITICAL')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100 transition shadow-2xs"
            >
              🔴 Krisis Tensi & Nyeri Dada (178/106)
            </button>
          </div>
        </div>

        {/* Worker Selection */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3.5">
            Pilih ID Pekerja / Scan Kartu Badge:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-600 shadow-xs ring-2 ring-rose-600/20'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-800">
                      {demo.worker.pseudonymId}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">{demo.worker.age} th • {demo.worker.gender === 'MALE' ? 'Pria' : 'Wanita'}</span>
                  </div>
                  <div className="text-base font-bold text-stone-900 mt-1 truncate">
                    {demo.worker.nameSynthetic}
                  </div>
                  <div className="text-xs text-stone-600 truncate mt-0.5 font-medium">
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
            <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors ${
              isCrisisBp ? 'border-rose-400 bg-rose-50/40' : isHighBp ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Activity className="w-4 h-4 text-stone-500" />
                  Sistolik (SBP)
                </span>
                <span className="text-xs text-stone-400 font-mono">mmHg</span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={80}
                max={240}
                value={systolicBp}
                onChange={(e) => setSystolicBp(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Normal: &lt;120 mmHg | Waspada: &ge;140
              </p>
            </div>

            {/* 2. Diastolic BP */}
            <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors ${
              diastolicBp >= 100 ? 'border-rose-400 bg-rose-50/40' : diastolicBp >= 90 ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Activity className="w-4 h-4 text-stone-500" />
                  Diastolik (DBP)
                </span>
                <span className="text-xs text-stone-400 font-mono">mmHg</span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={50}
                max={140}
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Normal: &lt;80 mmHg | Waspada: &ge;90
              </p>
            </div>

            {/* 3. Heart Rate */}
            <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors ${
              heartRate >= 100 ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Heart className="w-4 h-4 text-stone-500" />
                  Denyut Nadi (HR)
                </span>
                <span className="text-xs text-stone-400 font-mono">bpm</span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={40}
                max={180}
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Normal: 60–99 bpm | Aritmia: &ge;100
              </p>
            </div>

            {/* 4. SpO2 */}
            <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors ${
              isHypoxia ? 'border-rose-400 bg-rose-50/40' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Wind className="w-4 h-4 text-stone-500" />
                  Saturasi Oksigen
                </span>
                <span className="text-xs text-stone-400 font-mono">% SpO2</span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={80}
                max={100}
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Optimal: 95–100% | Hipoksia: &lt;95%
              </p>
            </div>

            {/* 5. Temperature */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Thermometer className="w-4 h-4 text-stone-500" />
                  Suhu Tubuh
                </span>
                <span className="text-xs text-stone-400 font-mono">°C</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={34}
                max={42}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Normal: 36.1–37.2 °C | Demam: &ge;37.5
              </p>
            </div>

            {/* 6. Sleep Hours */}
            <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors ${
              sleepHours < 5.0 ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                <span className="font-bold flex items-center gap-2 text-stone-900 text-sm">
                  <Moon className="w-4 h-4 text-stone-500" />
                  Durasi Tidur 24 Jam
                </span>
                <span className="text-xs text-stone-400 font-mono">Jam</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                max={16}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-2xl font-black text-stone-900 focus:outline-none focus:border-rose-600 focus:bg-white font-mono transition shadow-2xs tabular-nums"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                Cukup: &ge;6.0 Jam | Fatik: &lt;5.0
              </p>
            </div>
          </div>

          {/* Instant Safety Gate Live Indicator */}
          {(isCrisisBp || isHypoxia || hasCardiacSymptoms) && (
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-300 text-xs sm:text-sm text-rose-950 flex items-center gap-3.5 shadow-2xs">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 animate-pulse" />
              <div>
                <strong className="font-bold text-rose-950">Peringatan Batas Kritis Terdeteksi Langsung:</strong>
                <span className="ml-1.5 text-rose-800">
                  {isCrisisBp && 'Tekanan darah melewati batas toleransi kerja (>160/100). '}
                  {isHypoxia && 'Oksigenasi di bawah batas normal (<95%). '}
                  {hasCardiacSymptoms && 'Keluhan kardiovaskular dilaporkan. '}
                  Pekerja berpotensi berstatus UNFIT saat dikirimkan.
                </span>
              </div>
            </div>
          )}

          {/* Symptoms Checklist */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3.5">
              Apakah Anda Merasakan Keluhan / Gejala Subjektif Berikut Saat Ini?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                chestPain 
                  ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-bold shadow-2xs' 
                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="checkbox"
                  checked={chestPain}
                  onChange={(e) => setChestPain(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs sm:text-sm">Nyeri / Tekanan di Dada</span>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                dyspnea 
                  ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-bold shadow-2xs' 
                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="checkbox"
                  checked={dyspnea}
                  onChange={(e) => setDyspnea(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs sm:text-sm">Sesak Napas (Dyspnea)</span>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                dizziness 
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-2xs' 
                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="checkbox"
                  checked={dizziness}
                  onChange={(e) => setDizziness(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm">Pusing / Kliyengan</span>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                palpitations 
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-2xs' 
                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="checkbox"
                  checked={palpitations}
                  onChange={(e) => setPalpitations(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm">Jantung Berdebar (Palpitasi)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm sm:text-base tracking-wide shadow-md flex items-center justify-center gap-3 transition-all disabled:opacity-50 min-h-[52px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Mengevaluasi Fisiologi & Triase AI...
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
          <div className={`border rounded-2xl p-6 sm:p-8 shadow-xs transition-all ${
            result.dailyFitnessVerdict === 'UNFIT'
              ? 'bg-rose-50/70 border-rose-200'
              : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/70">
              <div className="flex items-center gap-4">
                {result.dailyFitnessVerdict === 'UNFIT' ? (
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>
                ) : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION' ? (
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Hasil Triase Skrining Mandiri
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                    {result.verdictIndonesian}
                  </h2>
                </div>
              </div>

              <span className={`px-4 py-2 rounded-full text-xs font-black tracking-wide self-start sm:self-auto shadow-xs ${
                result.dailyFitnessVerdict === 'UNFIT'
                  ? 'bg-rose-600 text-white'
                  : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-700 text-white'
              }`}>
                {result.dailyFitnessVerdict}
              </span>
            </div>

            <div className="py-5 space-y-5">
              <p className="text-base text-stone-800 leading-relaxed font-medium">
                {result.triageSummary}
              </p>

              {/* Action items */}
              {result.triageRecommendations.length > 0 && (
                <div className="bg-white/90 rounded-xl p-5 border border-stone-200/80 space-y-2 shadow-2xs">
                  <span className="text-sm font-bold text-stone-900">Instruksi Langsung K3:</span>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-stone-700 space-y-1.5 leading-relaxed">
                    {result.triageRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Inference Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center shadow-2xs">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Layer 1 Klinis</div>
                  <div className="font-bold text-sm text-stone-900 mt-1">
                    Tier {result.inferenceSnapshot.layer1Tier}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center shadow-2xs">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Layer 2 LightGBM</div>
                  <div className="font-bold text-sm text-stone-900 mt-1 tabular-nums">
                    {(result.inferenceSnapshot.layer2Probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center shadow-2xs">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Layer 3 PyTorch DL</div>
                  <div className="font-bold text-sm text-stone-900 mt-1 tabular-nums">
                    {(result.inferenceSnapshot.layer3Probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center shadow-2xs">
                  <div className="text-xs text-stone-500 font-semibold uppercase">Autoencoder Anomali</div>
                  <div className={`font-bold text-sm mt-1 ${result.inferenceSnapshot.isAnomaly ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {result.inferenceSnapshot.isAnomaly ? 'ANOMALI AKUT' : 'Normal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action link */}
            <div className="pt-5 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-stone-600 font-mono">
                Pekerja: <strong className="text-stone-900">{currentWorker?.nameSynthetic}</strong> ({selectedWorkerId})
              </span>
              <Link
                href={`/worker/${selectedWorkerId}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-800 hover:text-rose-900 transition-colors"
              >
                Lihat Rekam Medis & Grafik DCU Lengkap
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
