'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  Stethoscope, 
  FileSpreadsheet, 
  ArrowRight, 
  Sparkles,
  Activity
} from 'lucide-react';

export interface EducationalEmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionText?: string;
  secondaryHref?: string;
  secondaryText?: string;
  icon?: 'stethoscope' | 'heart' | 'spreadsheet' | 'activity';
}

export function EducationalEmptyState({
  title = 'Belum Ada Data Rekam Medis Tercatat',
  description = 'Data kesehatan Anda aman dan terlindungi. Lakukan skrining harian di Kios Paramedis atau unggah data MCU tahunan untuk mulai memantau skor kesehatan jantung Anda.',
  actionHref = '/kiosk',
  actionText = 'Mulai Skrining Mandiri (DCU)',
  secondaryHref = '/workers',
  secondaryText = 'Lihat Sampel Pekerja Demo',
  icon = 'stethoscope'
}: EducationalEmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center max-w-xl mx-auto shadow-xs space-y-5">
      {/* Decorative Icon Circle */}
      <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
        {icon === 'stethoscope' && <Stethoscope className="w-8 h-8" />}
        {icon === 'heart' && <HeartHandshake className="w-8 h-8" />}
        {icon === 'spreadsheet' && <FileSpreadsheet className="w-8 h-8" />}
        {icon === 'activity' && <Activity className="w-8 h-8 animate-pulse" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {/* Educational Tips Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs text-slate-600">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Mengapa Skrining K3 Penting?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          Kombinasi data Medical Check-Up tahunan dan Daily Check-Up pra-shift membantu mendeteksi risiko silent-killer seperti hipertensi tersembunyi dan stres vaskular sebelum memasuki area berisiko tinggi.
        </p>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {actionHref && actionText && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {secondaryHref && secondaryText && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs shadow-2xs transition"
          >
            <span>{secondaryText}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
