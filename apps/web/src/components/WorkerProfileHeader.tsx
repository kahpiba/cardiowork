'use client';

import React from 'react';
import { User, ShieldAlert, Clock, Building2, Briefcase, Award } from 'lucide-react';

interface WorkerProfileHeaderProps {
  pseudonymId: string;
  department: string;
  jobTitle: string;
  shiftPattern: string;
  tenureMonths: number;
  gender: string;
  age: number;
  overallFitness: string;
}

export function WorkerProfileHeader({
  pseudonymId,
  department,
  jobTitle,
  shiftPattern,
  tenureMonths,
  gender,
  age,
  overallFitness
}: WorkerProfileHeaderProps) {
  let badgeColor = 'bg-emerald-50 text-emerald-950 border-emerald-300';
  if (overallFitness === 'FIT_WITH_RESTRICTION') badgeColor = 'bg-amber-50 text-amber-900 border-amber-300';
  if (overallFitness === 'UNFIT') badgeColor = 'bg-rose-50 text-rose-900 border-rose-300';

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        
        {/* Worker Avatar & Identity */}
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-700 flex items-center justify-center text-white font-black text-xl shadow-xs">
            {pseudonymId.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-black text-stone-900 font-mono tracking-tight">{pseudonymId}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeColor}`}>
                {overallFitness.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-0.5">
              Profil Rekam Medis Pekerja Ter-pseudonimisasi (Kepatuhan UU PDP No. 27/2022)
            </p>
          </div>
        </div>

        {/* Clinical Disclaimer Tag */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-2.5 text-right max-w-sm shadow-2xs">
          <div className="text-xs text-amber-900 font-bold uppercase tracking-wider flex items-center justify-end space-x-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            <span>Alat Dukungan Keputusan K3</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed mt-1">
            Bukan diagnosis mandiri. Seluruh hasil rekomendasi wajib divalidasi oleh dokter perusahaan berizin.
          </p>
        </div>

      </div>

      {/* Meta Grid - Neutralized Cohesive Icons & Increased Font Scale */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-3 border-t border-stone-100">
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80 flex items-center space-x-3">
          <Building2 className="h-5 w-5 text-stone-500 shrink-0" />
          <div>
            <span className="text-xs text-stone-500 block font-medium">Departemen:</span>
            <span className="text-sm text-stone-900 font-bold">{department}</span>
          </div>
        </div>

        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80 flex items-center space-x-3">
          <Briefcase className="h-5 w-5 text-stone-500 shrink-0" />
          <div>
            <span className="text-xs text-stone-500 block font-medium">Jabatan / Peran:</span>
            <span className="text-sm text-stone-900 font-bold">{jobTitle}</span>
          </div>
        </div>

        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80 flex items-center space-x-3">
          <Clock className="h-5 w-5 text-stone-500 shrink-0" />
          <div>
            <span className="text-xs text-stone-500 block font-medium">Pola Shift Kerja:</span>
            <span className="text-sm text-stone-900 font-bold">{shiftPattern.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80 flex items-center space-x-3">
          <Award className="h-5 w-5 text-stone-500 shrink-0" />
          <div>
            <span className="text-xs text-stone-500 block font-medium">Demografi & Masa Kerja:</span>
            <span className="text-sm text-stone-900 font-bold">{age} Th • {gender} • {Math.round(tenureMonths / 12)} Th Kerja</span>
          </div>
        </div>
      </div>
    </div>
  );
}
