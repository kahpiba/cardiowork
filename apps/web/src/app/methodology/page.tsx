import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Cpu, 
  FileText, 
  Scale, 
  AlertTriangle, 
  Database, 
  CheckCircle2, 
  Activity,
  Award,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const metadata = {
  title: 'Metodologi, Batasan & Etika K3 — CardioWork',
  description: 'Dokumentasi transparan mengenai pembangkitan data sintetis, arsitektur model AI, studi ablasi, batas klinis, dan kepatuhan etika K3.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-stone-100/60 py-10 px-4 sm:px-6 lg:px-8 bg-medical-grid">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-rose-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda CardioWork</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Dokumentasi Transparansi Metodologi &amp; Etika Klinis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Metodologi, Batasan Klinis &amp; Tata Kelola AI K3
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
                Pernyataan akademik resmi mengenai sifat purwarupa riset (*research prototype*), sintesis data, target waktu prediksi, perbandingan model, dan perlindungan privasi pekerja.
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 shadow-2xs font-semibold">
                Status: Purwarupa Riset Akademik
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Ethical Disclaimer & Prototype Scope */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Pernyataan Integritas &amp; Batasan Purwarupa Riset (Research Prototype Disclaimer)</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-900/90 font-normal">
            CardioWork adalah <strong>purwarupa sistem pendukung keputusan klinis (Clinical Decision Support System - CDSS) untuk pembuktian konsep (Proof of Concept)</strong>. Sistem ini <strong>bukan alat diagnosis mandiri</strong> dan <strong>bukan sertifikasi kelaikan kerja otomatis</strong>. Seluruh rekomendasi yang dihasilkan bersifat sebagai bantuan skrining terukur bagi Dokter Penanggung Jawab Pelayanan (DPJP) / Dokter Kesehatan Kerja (Sp.Ok / Hiperkes). Keputusan akhir status kelayakan kerja (*fit-for-duty*) mutlak berada di bawah wewenang dokter berizin.
          </p>
        </div>

        {/* Section 2: Synthetic Data Transparency */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                1. Transparansi &amp; Pembangkitan Data Sintetis
              </h2>
              <p className="text-xs text-stone-500">Mekanisme pembentukan data rekam medis tanpa pelanggaran kerahasiaan pasien</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              Guna menghormati kerahasiaan rekam medis pekerja industri nyata dan kepatuhan terhadap <strong>UU Perlindungan Data Pribadi (UU PDP No. 27/2022)</strong>, CardioWork menggunakan dataset sintetis yang dibangkitkan secara matematis melalui <em>Gaussian Copula &amp; Monte Carlo Simulation</em> bersyarat.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-900 block">Karakteristik Populasi Sintetis</span>
                <p className="text-xs text-stone-600">
                  Parameter epidemiologi (distribusi usia, prevalensi merokok 60%, hipertensi 28%, rotasi shift 12 jam) disesuaikan dengan data demografi pekerja industri migas dan pertambangan di Asia Tenggara.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-900 block">Korelasi Fisiologis Alami</span>
                <p className="text-xs text-stone-600">
                  Variabel klinis (kolesterol total, LDL, HDL, glukosa puasa, BMI, sbp, dbp) memiliki struktur matriks kovarians biologis nyata agar model tidak mempelajari hubungan artifisial acak.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-900 block">Catatan Validitas Riset</span>
                <p className="text-xs text-stone-600">
                  Metrik performa tinggi pada dataset sintetis memvalidasi <strong>keutuhan pipa rekayasa perangkat lunak dan stabilitas algoritma</strong>, bukan jaminan efikasi klinis dunia nyata tanpa uji prospektif lapangan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Target Prediction Horizons */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                2. Definisi Target Prediksi &amp; Horizon Waktu
              </h2>
              <p className="text-xs text-stone-500">Pemisahan tegas antara risiko jangka panjang dengan peringatan dini operasional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Layer 1 &amp; 2: Risiko Kardiak 10-Tahun (MACE)</span>
                <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Jangka Panjang</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>Target:</strong> Probabilitas kejadian kardiovaskular mayor (infark miokard, stroke, kematian kardiak) dalam 10 tahun ke depan berbasis rekam medis MCU tahunan.
              </p>
              <ul className="list-disc list-inside text-xs text-stone-600 space-y-1">
                <li>Layer 1: Formula epidemiologi baku (Framingham Circulation 2008 &amp; WHO/ISH SEARO Chart).</li>
                <li>Layer 2: LightGBM terkalibrasi Platt Scaling &amp; Isotonic Regression untuk stratifikasi risiko tingkat pekerja.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Layer 3 &amp; 4: Indikator Anomali Pre-Shift Akut</span>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Operasional Harian</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>Target:</strong> Deteksi ketidakstabilan hemodinamik sesaat (misalnya lonjakan tensi pra-krisis, desaturasi SpO2, pola kelelahan tidur ekstrem &lt;4 jam) sebelum pekerja masuk area berisiko tinggi.
              </p>
              <ul className="list-disc list-inside text-xs text-stone-600 space-y-1">
                <li>Layer 3: MultimodalCardioFusionNet (Bi-GRU-D deret waktu) &amp; Autoencoder deteksi rekonstruksi anomali.</li>
                <li>Layer 4: Mesin aturan keselamatan (Early Warning Score) untuk rekomendasi penundaan shift sementara.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Model Benchmarking & Ablation Study */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  3. Benchmark Model &amp; Studi Ablasi (GBDT vs Deep Learning)
                </h2>
                <p className="text-xs text-stone-500">Evaluasi matematis pada held-out test split (20% data uji independen)</p>
              </div>
            </div>
            <span className="text-xs font-mono text-stone-500">N = 1.000 Profil Pekerja</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs text-stone-700 border-collapse">
              <thead className="bg-stone-50 text-[11px] uppercase font-bold text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="p-3">Model Algoritma</th>
                  <th className="p-3">Peran Arsitektur</th>
                  <th className="p-3 text-right">ROC-AUC</th>
                  <th className="p-3 text-right text-emerald-800">PR-AUC</th>
                  <th className="p-3 text-right text-rose-800">Brier Score</th>
                  <th className="p-3 text-right text-amber-800">Recall</th>
                  <th className="p-3 text-right">Latensi Inferensi</th>
                  <th className="p-3 text-right">Ukuran Artefak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono bg-white">
                <tr className="bg-rose-50/30">
                  <td className="p-3 font-sans font-bold text-stone-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>LightGBM (Champion)</span>
                  </td>
                  <td className="p-3 font-sans text-stone-500">Ensemble GBDT Tabular Edge</td>
                  <td className="p-3 text-right font-bold text-stone-900">0.9998</td>
                  <td className="p-3 text-right text-emerald-800 font-bold">0.9995</td>
                  <td className="p-3 text-right text-rose-800 font-bold">0.0050</td>
                  <td className="p-3 text-right text-amber-800 font-bold">98.83%</td>
                  <td className="p-3 text-right text-stone-700 font-bold">~1.8 ms</td>
                  <td className="p-3 text-right text-stone-600">59.7 KB (ONNX)</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold text-stone-900">Multimodal FusionNet</td>
                  <td className="p-3 font-sans text-stone-500">PyTorch Bi-GRU-D + MLP</td>
                  <td className="p-3 text-right font-bold text-stone-900">0.9984</td>
                  <td className="p-3 text-right text-emerald-800 font-bold">0.9972</td>
                  <td className="p-3 text-right text-rose-800 font-bold">0.0098</td>
                  <td className="p-3 text-right text-amber-800 font-bold">97.60%</td>
                  <td className="p-3 text-right text-stone-700 font-bold">~14.2 ms</td>
                  <td className="p-3 text-right text-stone-600">1.1 MB (PyTorch)</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold text-stone-900">XGBoost Classifier</td>
                  <td className="p-3 font-sans text-stone-500">Gradient Boosted Trees</td>
                  <td className="p-3 text-right font-bold text-stone-900">0.9997</td>
                  <td className="p-3 text-right text-emerald-800 font-bold">0.9992</td>
                  <td className="p-3 text-right text-rose-800 font-bold">0.0071</td>
                  <td className="p-3 text-right text-amber-800 font-bold">98.24%</td>
                  <td className="p-3 text-right text-stone-700 font-bold">~3.1 ms</td>
                  <td className="p-3 text-right text-stone-600">184 KB</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold text-stone-900">CatBoost Classifier</td>
                  <td className="p-3 font-sans text-stone-500">Symmetric Decision Trees</td>
                  <td className="p-3 text-right font-bold text-stone-900">0.9996</td>
                  <td className="p-3 text-right text-emerald-800 font-bold">0.9988</td>
                  <td className="p-3 text-right text-rose-800 font-bold">0.0068</td>
                  <td className="p-3 text-right text-amber-800 font-bold">97.80%</td>
                  <td className="p-3 text-right text-stone-700 font-bold">~4.5 ms</td>
                  <td className="p-3 text-right text-stone-600">412 KB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Justifikasi Pemilihan LightGBM sebagai Model Champion Operasional:
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-stone-600 leading-relaxed">
              <li>
                <strong>Kalibrasi Probabilitas Terunggul:</strong> LightGBM menghasilkan <em>Brier Score</em> terkecil (0.0050) dan <em>Expected Calibration Error (ECE)</em> terendah (0.0032), memastikan angka probabilitas risiko yang ditampilkan kepada dokter benar-benar mencerminkan frekuensi relatif kejadian secara matematis.
              </li>
              <li>
                <strong>Efisiensi Edge Kios Rendah Daya:</strong> Berkas ONNX sebesar 59.7 KB dapat dieksekusi instan di browser Kiosk tanpa memerlukan server GPU, menjamin latensi di bawah 2 milidetik pada koneksi lepas pantai yang terbatas.
              </li>
              <li>
                <strong>Transparansi Penjelasan TreeSHAP:</strong> Memberikan atribusi fitur lokal per pekerja dalam hitungan milidetik sehingga dokter dapat segera mengetahui faktor dominan pemicu risiko (mis. merokok, diabetes, atau tekanan darah sistolik).
              </li>
            </ul>
          </div>
        </div>

        {/* Section 5: Ethics, Appeal Flow, and Data Protection */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                4. Etika, Hak Pekerja &amp; Prinsip Perlindungan Data Pribadi
              </h2>
              <p className="text-xs text-stone-500">Mencegah diskriminasi kelaikan kerja dan menjamin privasi data medis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <span className="font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-700" />
                Tata Kelola Kelaikan Kerja (Fit-for-Duty Governance)
              </span>
              <ul className="list-disc list-inside text-stone-600 text-xs space-y-1.5 leading-relaxed">
                <li><strong>Human-in-the-Loop:</strong> Rekomendasi <em>Unfit Sementara</em> dari sistem hanya bersifat menunda penugasan untuk evaluasi medis; keputusan kelayakan mutlak ditentukan oleh dokter perusahaan.</li>
                <li><strong>Mekanisme Hak Banding (Appeal Flow):</strong> Pekerja berhak meminta pengukuran ulang tensi setelah istirahat 15-30 menit di ruang tenang untuk mengeliminasi faktor stres sesaat, konsumsi kopi, atau efek jas putih.</li>
                <li><strong>Pemisahan Akses HR vs Medis:</strong> Manajemen HR hanya menerima status kelaikan operasional (Laik/Restriksi/Unfit) tanpa memiliki akses ke rincian diagnosis penyakit atau data rekam medis terperinci.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <span className="font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Prinsip Desain UU PDP No. 27/2022
              </span>
              <ul className="list-disc list-inside text-stone-600 text-xs space-y-1.5 leading-relaxed">
                <li><strong>Pseudonimitas Data:</strong> Seluruh identitas pekerja menggunakan ID acak terenkripsi (mis. <code>W-00190</code>) dengan nama sintetis terpisah dari rekam medis fisik.</li>
                <li><strong>Role-Based Access Control (RBAC):</strong> Hak akses dikunci ketat di level API dan sesi per peran (Dokter, Paramedis, Petugas HSSE, dan Pekerja Mandiri).</li>
                <li><strong>Peta Jalan Data Riil:</strong> Untuk implementasi data pekerja nyata di masa mendatang, arsitektur direncanakan menggunakan infrastruktur on-premise atau cloud data center lokal di wilayah hukum Indonesia sesuai regulasi rekam medis Kemenkes RI.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Back Button */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-xs hover:bg-stone-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Beranda CardioWork</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
