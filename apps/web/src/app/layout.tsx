import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardioWork — Prediksi Risiko Kardiovaskular Pekerja (MCU + DCU)',
  description: 'Sistem Terpadu Pendukung Keputusan Klinis K3 untuk Evaluasi Risiko Kardiovaskular Berbasis Edge AI & Multi-Tier Models.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
        
        {/* Banner Kepatuhan Medis Wajib */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>DATA SINTETIS — BUKAN BUKTI KLINIS | Sistem Pendukung Keputusan Klinis K3 (Bukan Alat Diagnosis Mandiri)</span>
        </div>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              CardioWork Platform © 2026 • S1 Sains Data UPN Veteran Jawa Timur
            </div>
            <div>
              Kepatuhan UU PDP No. 27/2022 • Serverless Vercel Architecture (sin1)
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
