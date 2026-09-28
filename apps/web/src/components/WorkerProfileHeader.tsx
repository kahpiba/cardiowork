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
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (overallFitness === 'FIT_WITH_RESTRICTION') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  if (overallFitness === 'UNFIT') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        
        {/* Worker Avatar & Identity */}
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-sky-600/10">
            {pseudonymId.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 font-mono">{pseudonymId}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                {overallFitness.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Profil Pekerja Industri Migas Ter-pseudonimisasi (Kepatuhan UU PDP No. 27/2022)
            </p>
          </div>
        </div>

        {/* Clinical Disclaimer Tag */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-right max-w-xs shadow-2xs">
          <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center justify-end space-x-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span>Decision Support Tool</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-tight mt-0.5">
            Bukan diagnosis mandiri. Seluruh hasil wajib divalidasi dokter perusahaan.
          </p>
        </div>

      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-sky-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">Departemen:</span>
            <span className="text-slate-900 font-semibold">{department}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-teal-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">Jabatan / Peran:</span>
            <span className="text-slate-900 font-semibold">{jobTitle}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">Pola Shift:</span>
            <span className="text-slate-900 font-semibold">{shiftPattern.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <Award className="h-4 w-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">Demografi & Masa Kerja:</span>
            <span className="text-slate-900 font-semibold">{age} Th • {gender} • {Math.round(tenureMonths / 12)} Th Kerja</span>
          </div>
        </div>
      </div>
    </div>
  );
}
