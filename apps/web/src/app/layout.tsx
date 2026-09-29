import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

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
    <html lang="id">
      <body className="min-h-screen bg-[#FAFAF9] text-stone-900 flex flex-col font-sans antialiased selection:bg-teal-700 selection:text-white">
        
        {/* Banner Kepatuhan Medis Wajib */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-950 text-xs py-2 px-4 text-center font-medium flex items-center justify-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>DATA SINTETIS — BUKAN BUKTI KLINIS | Sistem Pendukung Keputusan Klinis K3 (Bukan Alat Diagnosis Mandiri)</span>
        </div>

        {/* Global Navigation Bar */}
        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-xs py-5 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">CardioWork Platform</span>
              <span>© 2026 • S1 Sains Data UPN Veteran Jawa Timur</span>
            </div>
            <div className="text-slate-500">
              Kepatuhan UU PDP No. 27/2022 • Serverless Vercel Architecture (sin1)
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
