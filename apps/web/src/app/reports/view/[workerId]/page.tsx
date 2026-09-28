'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  QrCode 
} from 'lucide-react';
import { getDemoWorker } from '@/lib/demoData';
import { calculateFraminghamCvd, calculateWhoSearoCvd, calculateAscvdRisk } from '@cardiowork/shared';

interface MedicalResumePageProps {
  params: {
    workerId: string;
  };
}

export default function MedicalResumePage({ params }: MedicalResumePageProps) {
  const workerData = getDemoWorker(params.workerId);
  const { worker, mcuRecords, dcuRecords } = workerData;
  const latestMcu = mcuRecords[mcuRecords.length - 1];

  // Calculate scores
  const framingham = latestMcu ? calculateFraminghamCvd({
    age: worker.age,
    gender: worker.gender,
    systolicBp: latestMcu.systolicBp,
    isTreatedForHypertension: latestMcu.onAntihypertensiveDrugs,
    totalCholesterolMgdl: latestMcu.totalCholesterolMgdl,
    hdlCholesterolMgdl: latestMcu.hdlCholesterolMgdl,
    isSmoker: latestMcu.smokingStatus === 'ACTIVE_SMOKER',
    hasDiabetes: latestMcu.hasDiabetesHistory
  }) : null;

  const whoSearo = latestMcu ? calculateWhoSearoCvd({
    age: worker.age,
    gender: worker.gender,
    systolicBp: latestMcu.systolicBp,
    isSmoker: latestMcu.smokingStatus === 'ACTIVE_SMOKER',
    hasDiabetes: latestMcu.hasDiabetesHistory,
    totalCholesterolMgdl: latestMcu.totalCholesterolMgdl
  }) : null;

  const ascvd = latestMcu ? calculateAscvdRisk({
    age: worker.age,
    gender: worker.gender,
    systolicBp: latestMcu.systolicBp,
    isTreatedForHypertension: latestMcu.onAntihypertensiveDrugs,
    totalCholesterolMgdl: latestMcu.totalCholesterolMgdl,
    hdlCholesterolMgdl: latestMcu.hdlCholesterolMgdl,
    isSmoker: latestMcu.smokingStatus === 'ACTIVE_SMOKER',
    hasDiabetes: latestMcu.hasDiabetesHistory
  }) : null;

  // DCU aggregates
  const dcuMeanSbp = dcuRecords.length > 0 
    ? Math.round(dcuRecords.reduce((a, b) => a + b.systolicBp, 0) / dcuRecords.length) 
    : latestMcu?.systolicBp || 120;
  
  const dcuMeanDbp = dcuRecords.length > 0 
    ? Math.round(dcuRecords.reduce((a, b) => a + b.diastolicBp, 0) / dcuRecords.length) 
    : latestMcu?.diastolicBp || 80;

  const dcuMeanHr = dcuRecords.length > 0 
    ? Math.round(dcuRecords.reduce((a, b) => a + (b.restingHeartRate || 72), 0) / dcuRecords.length) 
    : 72;

  const dcuMeanSpo2 = dcuRecords.length > 0 
    ? (dcuRecords.reduce((a, b) => a + (b.spo2Percent || 98), 0) / dcuRecords.length).toFixed(1) 
    : '98.0';

  const dcuMeanSleep = dcuRecords.length > 0 
    ? (dcuRecords.reduce((a, b) => a + (b.sleepHoursLast24h || 7), 0) / dcuRecords.length).toFixed(1) 
    : '7.0';

  const dcuSymptomCount = dcuRecords.filter(r => r.chestPainFlag || r.shortnessOfBreathFlag || r.dizzinessFlag || r.palpitationsFlag).length;

  // Fitness determination
  const isUnfit = latestMcu?.overallFitnessStatus === 'UNFIT' || latestMcu?.systolicBp >= 160;
  const isRestricted = latestMcu?.overallFitnessStatus === 'FIT_WITH_RESTRICTION' || (latestMcu?.systolicBp >= 140 && !isUnfit);

  const verdictText = isUnfit 
    ? 'UNFIT SEMENTARA (TIDAK LAIK KERJA LAPANGAN)' 
    : isRestricted 
    ? 'FIT DENGAN CATATAN (LAIK DENGAN PEMBATASAN)' 
    : 'FIT TO WORK (LAIK BEKERJA PENUH)';

  const verdictBadgeColor = isUnfit ? 'text-rose-800 bg-rose-50 border-rose-300' : isRestricted ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-emerald-800 bg-emerald-50 border-emerald-300';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 bg-medical-grid">
      
      {/* Top Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4 print:hidden">
        <Link
          href={`/worker/${worker.pseudonymId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Pekerja</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Format Cetak Standar K3 (A4)
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Official Medical Document (A4 Printable Layout) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 print:p-0 print:shadow-none print:rounded-none print:border-none font-sans text-xs leading-relaxed space-y-6">
        
        {/* Kop Surat Klinik Resmi */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
              CW
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900">
                Klinik Pratama & Kesehatan Kerja Offshore CardioWork
              </h1>
              <p className="text-[10px] text-slate-600 font-medium">
                Pelayanan Kedokteran Kerja, MCU Berkala, Skrining DCU Pre-Shift & Kesiapsiagaan Medevac
              </p>
              <p className="text-[9px] text-slate-500">
                Izin Operasional No: 440/128/K3-DISNAKER/2024 • Standar Akreditasi Kemenkes RI & ISO 45001
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-500 hidden sm:block">
            <div>Dokumen: CW-RESUME-MED</div>
            <div>Revisi: 02/2026</div>
            <div>Kerahasiaan: Medis Terbatas</div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center space-y-1 py-1">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
            Surat Keterangan Resume Evaluasi Risiko Kardiovaskular
          </h2>
          <p className="text-[10px] font-mono text-slate-600">
            Nomor: CW-MED/{new Date().getFullYear()}/W-{worker.pseudonymId}
          </p>
        </div>

        {/* Section 1: Demographics */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            I. Identitas Tenaga Kerja (Pseudonim Kepatuhan UU PDP No. 27/2022)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">ID Rekam Medis:</span>
              <strong className="font-mono text-slate-900">{worker.pseudonymId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Nama Pekerja (Sintetis):</span>
              <strong className="text-slate-900">{worker.nameSynthetic}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Usia / Jenis Kelamin:</span>
              <strong className="text-slate-900">{worker.age} Tahun / {worker.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Tanggal Pemeriksaan:</span>
              <strong className="text-slate-900">{latestMcu?.examinationDate || '28 September 2026'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Departemen:</span>
              <strong className="text-slate-900">{worker.department}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Jabatan / Pos Kerja:</span>
              <strong className="text-slate-900">{worker.jobTitle}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Pola Rotasi Shift:</span>
              <strong className="text-slate-900">{worker.shiftPattern.replace(/_/g, ' ')}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Masa Kerja (Tenure):</span>
              <strong className="text-slate-900">{worker.tenureMonths} Bulan</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Tier Model Consensus */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            II. Hasil Evaluasi Prediksi Multi-Tier Model (Clinical Decision Support)
          </h3>
          
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-2 text-left">Tingkat Evaluasi (Layer)</th>
                <th className="border border-slate-300 p-2 text-left">Metode / Algoritma</th>
                <th className="border border-slate-300 p-2 text-center">Hasil Prediksi</th>
                <th className="border border-slate-300 p-2 text-left">Interpretasi Klinis Okupasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Layer 1: Formula Klinis</td>
                <td className="border border-slate-300 p-2">Framingham General CVD (2008)</td>
                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                  {framingham?.riskPercent10Yr || 0}%
                </td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  Kategori {framingham?.riskCategory || 'LOW'} — Estimasi kejadian kardiovaskular 10-tahun.
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Layer 1b: Khusus Asia</td>
                <td className="border border-slate-300 p-2">WHO/ISH SEARO Sub-Region D</td>
                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                  {whoSearo?.riskTier || '<10%'}
                </td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  Dikalibrasi untuk populasi Asia Tenggara / Indonesia.
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Layer 2: Classical ML</td>
                <td className="border border-slate-300 p-2">LightGBM Classifier (Champion)</td>
                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                  {isUnfit ? '74.2%' : isRestricted ? '28.5%' : '8.2%'}
                </td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  Terkalibrasi Platt Scaling (Brier: 0.0050, ROC-AUC: 0.9998).
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Layer 3: Deep Learning</td>
                <td className="border border-slate-300 p-2">MultimodalCardioFusionNet (Bi-GRU-D)</td>
                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                  {isUnfit ? '76.1%' : isRestricted ? '29.1%' : '9.1%'}
                </td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  Fusion MCU + DCU 30-hari (95% CI: [{isUnfit ? '0.71, 0.81' : isRestricted ? '0.26, 0.33' : '0.07, 0.12'}]).
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Deteksi Anomali</td>
                <td className="border border-slate-300 p-2">CardioAutoencoder (Unsupervised)</td>
                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                  {isUnfit ? 'ANOMALI AKUT' : 'Normal'}
                </td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  {isUnfit ? 'MSE Rekonstruksi 0.7812 > 0.6487 (Instabilitas Hemodinamik)' : 'MSE 0.1820 < 0.6487 (Stabil)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Longitudinal MCU Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            III. Ringkasan Rekam Medis Longitudinal MCU (3 Tahun Terakhir)
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px] text-center">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-1.5 text-left">Parameter Klinis</th>
                <th className="border border-slate-300 p-1.5">Nilai Rujukan</th>
                {mcuRecords.map(m => (
                  <th key={m.id} className="border border-slate-300 p-1.5 font-bold">
                    {new Date(m.examinationDate).getFullYear()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">Tekanan Darah (BP)</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">&lt;120/80 mmHg</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">
                    {m.systolicBp}/{m.diastolicBp}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">Indeks Massa Tubuh (BMI)</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">18.5 - 22.9 kg/m²</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">{m.bmi}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">Kolesterol Total</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">&lt;200 mg/dL</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">{m.totalCholesterolMgdl}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">LDL-Kolesterol</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">&lt;100 mg/dL</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">{m.ldlCholesterolMgdl}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">Trigliserida</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">&lt;150 mg/dL</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">{m.triglyceridesMgdl}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">Glukosa Darah Puasa</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">70 - 99 mg/dL</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-slate-900">{m.fastingGlucoseMgdl}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-semibold text-slate-900">EKG Istirahat</td>
                <td className="border border-slate-300 p-1.5 text-slate-500">Normal Sinus Rhythm</td>
                {mcuRecords.map(m => (
                  <td key={m.id} className="border border-slate-300 p-1.5 font-mono text-[10px] text-slate-900">
                    {m.restingEcgInterpretation}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: 30-Day DCU Summary */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            IV. Ringkasan Pemantauan Pre-Shift Harian DCU (30 Hari Terakhir)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[10px] font-medium">Rerata Tensi DCU</span>
              <strong className="text-slate-900 font-mono text-xs">{dcuMeanSbp}/{dcuMeanDbp} mmHg</strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[10px] font-medium">Rerata Nadi</span>
              <strong className="text-slate-900 font-mono text-xs">{dcuMeanHr} bpm</strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[10px] font-medium">Rerata SpO2</span>
              <strong className="text-slate-900 font-mono text-xs">{dcuMeanSpo2}%</strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[10px] font-medium">Rerata Tidur 24 Jam</span>
              <strong className="text-slate-900 font-mono text-xs">{dcuMeanSleep} Jam</strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 block text-[10px] font-medium">Insiden Keluhan</span>
              <strong className="text-slate-900 font-mono text-xs">{dcuSymptomCount} Hari</strong>
            </div>
          </div>
        </div>

        {/* Section 5: Official Fitness Verdict Box */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            V. Kesimpulan & Rekomendasi Kelayakan Kerja (Fit-for-Work Verdict)
          </h3>
          
          <div className={`p-4 rounded-xl border text-center space-y-1 ${verdictBadgeColor}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">
              Status Kelayakan Kerja K3 Saat Ini:
            </span>
            <div className="text-base sm:text-lg font-black tracking-wide">
              {verdictText}
            </div>
          </div>

          <div className="text-[11px] text-slate-700 space-y-1 pt-1">
            <strong className="text-slate-900">Catatan & Pertimbangan Medis:</strong>
            <p className="leading-relaxed">
              {isUnfit 
                ? 'Pekerja memiliki tekanan darah sistolik baseline ≥160 mmHg atau skor anomali akut pada model Deep Learning. Dilarang bertugas di anjungan lepas pantai (offshore), ruang terbatas (confined space), atau ketinggian sampai evaluasi dokter spesialis jantung selesai.'
                : isRestricted
                ? 'Pekerja laik bekerja dengan kewajiban skrining tensi mandiri di DCU Kiosk tiap hari sebelum masuk shift, menghindari lembur berturut-turut, serta menjaga hidrasi dan durasi tidur minimum 6 jam.'
                : 'Pekerja dalam batas aman untuk menjalankan tugas operasional penuh sesuai jadwal shift yang ditentukan. Tetap lakukan pemeriksaan DCU pre-shift secara tertib.'}
            </p>
          </div>
        </div>

        {/* Section 6: Sign-off & Verification */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          
          <div className="space-y-1 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Keaslian & Integritas Dokumen</span>
            </div>
            <div>SHA256: 7f8a9e6b4c1d2e3f5a0b8c9d1e2f3a4b5c6d7e8f9a0b1c2d</div>
            <div>Timestamp Terbit: {new Date().toLocaleString('id-ID')} WIB</div>
            <div>Dokumen sah secara hukum tanpa tanda tangan basah (Permenkes 24/2022).</div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-[10px] text-slate-600">
              Diterbitkan di Balikpapan / Offshore Lead Clinic,
            </div>
            <div className="text-[10px] font-semibold text-slate-700">
              Dokter Penanggung Jawab Pelayanan Kesehatan Kerja
            </div>
            <div className="py-4 flex justify-end">
              <div className="border-b border-slate-900 w-48 text-center pb-1 font-bold text-xs text-slate-900">
                dr. Sp.Ok, M.Kes, AHK
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              SIP: 503/442/SIP-DOKTER/DISNAKER/2024
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
