'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Apple, 
  Droplets, 
  Coffee, 
  TrendingUp, 
  HelpCircle, 
  PhoneCall, 
  Info,
  ChevronRight,
  HardHat
} from 'lucide-react';
import { DEMO_WORKERS } from '@/lib/demoData';
import { Card3DTilt } from '@/components/3d/Card3DTilt';
import { Interactive3DHeart } from '@/components/3d/Interactive3DHeart';
import { AnimatedNumber } from '@/components/animations/AnimatedNumber';

export default function WorkerPortalPage() {
  const workerData = DEMO_WORKERS['W-00192'];
  const worker = workerData.worker;
  const latestMcu = workerData.mcuRecords[workerData.mcuRecords.length - 1];
  const dcuHistory = workerData.dcuRecords || [];
  const latestDcu = dcuHistory[dcuHistory.length - 1] || {
    systolicBp: 126,
    diastolicBp: 83,
    restingHeartRate: 82,
    spo2Percent: 98,
    sleepHoursLast24h: 5.3,
    caffeineIntakeCups: 2,
    recordedAt: '2026-11-28T18:30:00Z',
  };

  const [activeTab, setActiveTab] = useState<'vitals' | 'education' | 'schedule'>('vitals');

  return (
    <div className="bg-medical-grid min-h-[calc(100vh-4rem)] pb-20">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-stone-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {worker.nameSynthetic.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  {worker.nameSynthetic}
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {worker.pseudonymId}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5" />
                  {worker.jobTitle}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {worker.department} &bull; Umur {worker.age} Thn &bull; Masa Kerja {worker.tenureMonths} Bulan &bull; Rotasi 12 Jam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <Activity className="w-4 h-4 animate-heartbeat" />
              <span>Cek Mandiri di Kiosk Pre-Shift</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Status Laik Kerja Pre-Shift Hari Ini (Fit-for-Work Decision Banner) */}
        <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Status Kelaikan Kerja Hari Ini (Fit-for-Work)
                </span>
                <h2 className="text-xl font-black text-amber-950">
                  FIT DENGAN CATATAN (Fit With Restriction)
                </h2>
              </div>
            </div>
            <div className="text-xs text-amber-800 font-semibold bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 inline-block self-start sm:self-auto">
              Berlaku s.d. Akhir Shift (19:00 WIB)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-950">
            <div className="md:col-span-2 space-y-1.5 leading-relaxed">
              <p>
                <strong className="font-bold text-amber-900">Rekomendasi Dokter Okupasi (dr. Satria Wibowo, Sp.Ok):</strong>
              </p>
              <p className="text-stone-700">
                Pemeriksaan tensi darah pre-shift menunjukkan angka <strong className="text-stone-900 font-semibold">{latestDcu.systolicBp}/{latestDcu.diastolicBp} mmHg</strong> (kategori Pre-hipertensi Grade 1) dan durasi tidur <strong className="text-stone-900 font-semibold">{latestDcu.sleepHoursLast24h} jam</strong>. Anda laik bertugas di area rig dengan kewajiban mematuhi hidrasi minimal 2,5 Liter air mineral per shift, peregangan tiap 2 jam, serta menghindari minuman berkafein tinggi.
              </p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-stone-900 block text-xs">Peringatan Keselamatan K3:</span>
              <p className="text-stone-600 text-xs">
                Segera lapor ke Paramedis klinik site bila mengalami rasa tertekan di dada, pusing mendadak, atau sesak napas.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'vitals'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tanda Vital & Tren Tensi</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'education'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Panduan Hidup Sehat & Diet DASH</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal Pemeriksaan & Riwayat MCU</span>
          </button>
        </div>

        {/* Tab 1: Tanda Vital & Tren Tensi */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            
            {/* 4 Kartu Vital Terakhir dengan Efek 3D Tilt Spasial & Animated Numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card3DTilt maxTilt={8} scale={1.03}>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1 h-full">
                  <span className="text-xs font-semibold text-stone-500 block">Tekanan Darah Terakhir</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-700">
                      <AnimatedNumber value={latestDcu.systolicBp} />/<AnimatedNumber value={latestDcu.diastolicBp} />
                    </span>
                    <span className="text-xs text-stone-500 font-medium">mmHg</span>
                  </div>
                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                    Pre-hipertensi
                  </div>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8} scale={1.03}>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1 h-full">
                  <span className="text-xs font-semibold text-stone-500 block">Detak Jantung (Resting HR)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-teal-800">
                      <AnimatedNumber value={latestDcu.restingHeartRate} />
                    </span>
                    <span className="text-xs text-stone-500 font-medium">bpm</span>
                  </div>
                  <div className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                    Normal (60–100 bpm)
                  </div>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8} scale={1.03}>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1 h-full">
                  <span className="text-xs font-semibold text-stone-500 block">Saturasi Oksigen (SpO2)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-teal-800">
                      <AnimatedNumber value={latestDcu.spo2Percent} />
                    </span>
                    <span className="text-xs text-stone-500 font-medium">%</span>
                  </div>
                  <div className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                    Optimal (&ge;95%)
                  </div>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8} scale={1.03}>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1 h-full">
                  <span className="text-xs font-semibold text-stone-500 block">Tidur 24 Jam Terakhir</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-stone-800">
                      <AnimatedNumber value={latestDcu.sleepHoursLast24h} decimals={1} />
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Jam</span>
                  </div>
                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                    Perlu Istirahat Ekstra
                  </div>
                </div>
              </Card3DTilt>
            </div>

            {/* Model 3D Jantung Real-Time & Riwayat Grafik Tekanan Darah */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Kolom Kiri: 3D Pulsing Heart Telemetry Card */}
              <div className="lg:col-span-4">
                <Card3DTilt maxTilt={8} scale={1.02} className="h-full">
                  <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-3 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-teal-700 animate-heartbeat" />
                          <h4 className="font-bold text-stone-900 text-sm">Denyut Kardiak 3D</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {latestDcu.restingHeartRate} BPM
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-2">
                        Simulasi ritme denyut jantung Anda berdasarkan pemeriksaan DCU terakhir:
                      </p>
                    </div>

                    <Interactive3DHeart initialBpm={latestDcu.restingHeartRate || 82} compact={true} interactive={true} />
                  </div>
                </Card3DTilt>
              </div>

              {/* Kolom Kanan: Riwayat Grafik Tekanan Darah 30 Hari */}
              <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    Grafik Tren Tekanan Darah Harian (DCU Pre-Shift)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pemantauan konsistensi tensi darah Anda sebelum memasuki area rig kerja
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-stone-700">
                    <span className="w-3 h-3 rounded-full bg-teal-700"></span> Sistolik
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-stone-700">
                    <span className="w-3 h-3 rounded-full bg-amber-600"></span> Diastolik
                  </span>
                </div>
              </div>

              {/* Visual Bars Container */}
              <div className="pt-2">
                <div className="h-48 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-4 pt-6 px-1">
                  {dcuHistory.slice(-20).map((item, idx) => {
                    const sysHeight = Math.min(100, Math.max(20, ((item.systolicBp - 90) / 70) * 100));
                    const diaHeight = Math.min(100, Math.max(15, ((item.diastolicBp - 50) / 60) * 100));
                    const dateStr = item.recordedAt.split('T')[0].split('-').slice(1).join('/');

                    return (
                      <div key={idx} className="flex-1 min-w-[28px] max-w-[42px] flex flex-col items-center gap-1 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 bg-stone-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap shadow-md">
                          {item.systolicBp}/{item.diastolicBp} mmHg &bull; {item.restingHeartRate} bpm
                        </div>

                        {/* Bar pair */}
                        <div className="w-full flex items-end justify-center gap-0.5 h-36">
                          <div 
                            style={{ height: `${sysHeight}%` }} 
                            className={`w-1/2 rounded-t-sm transition-all ${
                              item.systolicBp >= 130 ? 'bg-amber-600' : 'bg-teal-700'
                            }`}
                          />
                          <div 
                            style={{ height: `${diaHeight}%` }} 
                            className="w-1/2 bg-stone-400 rounded-t-sm transition-all"
                          />
                        </div>

                        <span className="text-[10px] text-stone-500 font-mono">
                          {dateStr}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    Garis batas normal AHA/PERKI untuk orang dewasa adalah di bawah <strong className="text-stone-800">120/80 mmHg</strong>. Kisaran <strong className="text-stone-800">120–129 mmHg</strong> sistolik tergolong tekanan darah meningkat, dan <strong className="text-stone-800">&ge;130 mmHg</strong> memerlukan pembatasan konsumsi garam serta manajemen stres kerja.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

        {/* Tab 2: Panduan Gaya Hidup & Diet DASH */}
        {activeTab === 'education' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Diet DASH di Rig */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Panduan Diet DASH di Mess Hall Rig</h3>
                  <p className="text-xs text-stone-500">Dietary Approaches to Stop Hypertension</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">1. Batasi Natrium / Garam Meja</strong>
                  <p>Maksimal 1 sendok teh (2.000 mg natrium) per hari. Hindari menambahkan kecap asin atau kuah mie instan berlebih di mess hall.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">2. Perbanyak Asupan Kalium</strong>
                  <p>Pilih pisang, jeruk, bayam, atau kentang rebus pada prasmanan rig. Kalium membantu ginjal membuang kelebihan natrium melalui urin.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">3. Kurangi Lemak Jenuh</strong>
                  <p>Utamakan ikan panggang atau ayam tanpa kulit daripada gorengan tepung berulang kali pakai.</p>
                </div>
              </div>
            </div>

            {/* Manajemen Tidur & Kafein Shift */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Tidur & Kafein untuk Pekerja Shift</h3>
                  <p className="text-xs text-stone-500">Optimasi ritme sirkadian kerja rig</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">1. Suasana Kamar Kedap Cahaya</strong>
                  <p>Gunakan penutup mata (eye-mask) dan penutup telinga (earplugs) di kabin tidur untuk menyimulasikan suasana malam.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">2. Aturan Minum Kopi (Kafein)</strong>
                  <p>Maksimal 2 cangkir di paruh pertama shift. Hindari kopi minimal 4 jam sebelum jam tidur selesai shift.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block">3. Power Nap 20 Menit</strong>
                  <p>Jika merasa sangat lelah saat pergantian jam kerja, tidur singkat 15–20 menit terbukti mengembalikan ketajaman reaksi tanpa memicu rasa limbung.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Jadwal Pemeriksaan & Riwayat MCU */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">Agenda Medis Terjadwal</h3>
              <p className="text-xs text-stone-500">Jadwal pemeriksaan kesehatan berkala oleh Departemen K3 & Medis</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-teal-900 text-sm block">Skrining Rutin Harian (Pre-Shift DCU Kiosk)</span>
                  <p className="text-teal-800">Wajib dilakukan setiap sebelum memulai giliran shift kerja di Rig Alpha.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-teal-900 block">Setiap Hari, 18:00 WIB</span>
                  <span className="text-teal-700">Kiosk Klinik Site</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-stone-900 text-sm block">Konsultasi Evaluasi Tensi & HbA1c</span>
                  <p className="text-stone-600">Review hasil pemantauan tensi 30 hari bersama dr. Satria Wibowo, Sp.Ok.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-900 block">05 Oktober 2026</span>
                  <span className="text-stone-500">Tele-medisin Site</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-stone-900 text-sm block">Medical Check-Up (MCU) Tahunan 2027</span>
                  <p className="text-stone-600">Pemeriksaan darah lengkap, rontgen toraks, treadmill stress test & audiometri.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-900 block">Juli 2027</span>
                  <span className="text-stone-500">RS Rujukan Rekanan</span>
                </div>
              </div>
            </div>

            {/* Riwayat MCU Terakhir */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h4 className="font-bold text-stone-900 text-sm">Ringkasan Hasil MCU Tahunan Terakhir (07 Juli 2026)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Kolesterol Total</span>
                  <span className="font-bold text-stone-900">{latestMcu?.totalCholesterolMgdl || 186} mg/dL</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Gula Darah Puasa</span>
                  <span className="font-bold text-stone-900">{latestMcu?.fastingGlucoseMgdl || 101} mg/dL</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">HbA1c</span>
                  <span className="font-bold text-amber-700">{latestMcu?.hba1cPercent || 7.7}%</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Interpretasi EKG</span>
                  <span className="font-bold text-teal-800">{latestMcu?.restingEcgInterpretation || 'NORMAL'}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Emergency Assistance Footer */}
        <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm block">Butuh Bantuan Medis Segera di Lapangan?</span>
              <p className="text-xs text-stone-400">Kontak radio klinik site atau tekan Ext: 119 untuk tim paramedis darurat.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700">
              Radio Channel: CH-12 (Medical)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
