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
  Stethoscope
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title & Guidance Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Terminal Skrining Mandiri Pre-Shift (DCU Kiosk)
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Self-Service
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Gunakan tensimeter, oximeter, dan termometer digital di klinik/pos medik untuk input mandiri sebelum shift kerja.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons for Demo */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Simulasi Cepat (Demo Presets):
            </span>
            <button
              type="button"
              onClick={() => applyPreset('NORMAL')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/80 transition-colors"
            >
              🟢 Normal Sehat (118/76)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ELEVATED')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800 hover:bg-amber-900/80 transition-colors"
            >
              🟡 Ambang Batas / Kelelahan (144/92)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('CRITICAL')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900/80 transition-colors"
            >
              🔴 Krisis Tensi & Nyeri Dada (178/106)
            </button>
          </div>
        </div>

        {/* Worker Selection */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
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
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      {demo.worker.pseudonymId}
                    </span>
                    <span className="text-[10px] text-zinc-400">{demo.worker.age} th</span>
                  </div>
                  <div className="text-sm font-semibold text-zinc-200 mt-1 truncate">
                    {demo.worker.nameSynthetic}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Sistolik (SBP)
                </span>
                <span className="text-[11px] text-zinc-500">mmHg</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min={80}
                  max={240}
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Normal: &lt;120 mmHg | Krisis: &ge;160
              </p>
            </div>

            {/* 2. Diastolic BP */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Diastolik (DBP)
                </span>
                <span className="text-[11px] text-zinc-500">mmHg</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min={50}
                  max={140}
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Normal: &lt;80 mmHg | Krisis: &ge;100
              </p>
            </div>

            {/* 3. Heart Rate */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  Denyut Nadi (HR)
                </span>
                <span className="text-[11px] text-zinc-500">bpm</span>
              </div>
              <input
                type="number"
                min={40}
                max={180}
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Normal: 60-99 bpm | Aritmia: &ge;100
              </p>
            </div>

            {/* 4. SpO2 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  Saturasi Oksigen
                </span>
                <span className="text-[11px] text-zinc-500">% SpO2</span>
              </div>
              <input
                type="number"
                min={80}
                max={100}
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Optimal: 95-100% | Hipoksia: &lt;92%
              </p>
            </div>

            {/* 5. Temperature */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  Suhu Tubuh
                </span>
                <span className="text-[11px] text-zinc-500">°C</span>
              </div>
              <input
                type="number"
                step="0.1"
                min={34}
                max={42}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Normal: 36.1 - 37.2 °C
              </p>
            </div>

            {/* 6. Sleep Hours */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Durasi Tidur 24 Jam
                </span>
                <span className="text-[11px] text-zinc-500">Jam</span>
              </div>
              <input
                type="number"
                step="0.5"
                min={0}
                max={16}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Cukup: &ge;6.0 Jam | Lelah: &lt;5.0 Jam
              </p>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Apakah Anda Merasakan Keluhan / Gejala Subjektif Berikut Saat Ini?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                chestPain 
                  ? 'bg-rose-950/40 border-rose-500 text-white font-bold' 
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}>
                <input
                  type="checkbox"
                  checked={chestPain}
                  onChange={(e) => setChestPain(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">Nyeri / Rasa Tertekan di Dada</span>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                dyspnea 
                  ? 'bg-rose-950/40 border-rose-500 text-white font-bold' 
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}>
                <input
                  type="checkbox"
                  checked={dyspnea}
                  onChange={(e) => setDyspnea(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">Sesak Napas (Dyspnea)</span>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                dizziness 
                  ? 'bg-amber-950/40 border-amber-500 text-white font-bold' 
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}>
                <input
                  type="checkbox"
                  checked={dizziness}
                  onChange={(e) => setDizziness(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs">Pusing / Kliyengan</span>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                palpitations 
                  ? 'bg-amber-950/40 border-amber-500 text-white font-bold' 
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
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
          <div className={`border rounded-2xl p-6 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            result.dailyFitnessVerdict === 'UNFIT'
              ? 'bg-rose-950/30 border-rose-500/60'
              : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
              ? 'bg-amber-950/30 border-amber-500/60'
              : 'bg-emerald-950/30 border-emerald-500/60'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {result.dailyFitnessVerdict === 'UNFIT' ? (
                  <ShieldAlert className="w-10 h-10 text-rose-500 shrink-0 animate-bounce" />
                ) : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION' ? (
                  <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
                )}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Hasil Triase Skrining Mandiri
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {result.verdictIndonesian}
                  </h2>
                </div>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide self-start sm:self-auto ${
                result.dailyFitnessVerdict === 'UNFIT'
                  ? 'bg-rose-600 text-white'
                  : result.dailyFitnessVerdict === 'FIT_WITH_RESTRICTION'
                  ? 'bg-amber-500 text-black'
                  : 'bg-emerald-600 text-white'
              }`}>
                {result.dailyFitnessVerdict}
              </span>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                {result.triageSummary}
              </p>

              {/* Action items */}
              {result.triageRecommendations.length > 0 && (
                <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 space-y-1.5">
                  <span className="text-xs font-bold text-zinc-300">Instruksi Langsung K3:</span>
                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                    {result.triageRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Inference Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400">Layer 1 Klinis</div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    Tier {result.inferenceSnapshot.layer1Tier}
                  </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400">Layer 2 LightGBM</div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    {(result.inferenceSnapshot.layer2Probability * 100).toFixed(1)}% Risiko
                  </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400">Layer 3 PyTorch DL</div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    {(result.inferenceSnapshot.layer3Probability * 100).toFixed(1)}% CVD
                  </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-zinc-400">Autoencoder Anomali</div>
                  <div className={`font-bold text-xs mt-0.5 ${result.inferenceSnapshot.isAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.inferenceSnapshot.isAnomaly ? 'ANOMALI AKUT' : 'Normal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action link */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                Pekerja: {currentWorker?.nameSynthetic} ({selectedWorkerId})
              </span>
              <Link
                href={`/worker/${selectedWorkerId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
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
