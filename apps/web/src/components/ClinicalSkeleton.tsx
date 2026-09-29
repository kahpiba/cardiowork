'use client';

import React from 'react';

export interface ClinicalSkeletonProps {
  variant?: 'card' | 'gauge' | 'chart' | 'table' | 'form';
  className?: string;
  label?: string;
}

export function ClinicalSkeleton({
  variant = 'card',
  className = '',
  label = 'Memuat data klinis...'
}: ClinicalSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs ${className}`}
    >
      <span className="sr-only">{label}</span>

      {variant === 'gauge' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-4 w-40 rounded-md animate-medical-shimmer" />
          <div className="h-28 w-48 rounded-t-full border-8 border-slate-100 animate-medical-shimmer" />
          <div className="h-8 w-24 rounded-lg animate-medical-shimmer" />
          <div className="h-4 w-32 rounded-full animate-medical-shimmer" />
        </div>
      )}

      {variant === 'chart' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 rounded-md animate-medical-shimmer" />
            <div className="h-7 w-32 rounded-lg animate-medical-shimmer" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl animate-medical-shimmer" />
            ))}
          </div>
          <div className="h-60 rounded-xl animate-medical-shimmer" />
        </div>
      )}

      {variant === 'table' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2">
            <div className="h-5 w-40 rounded-md animate-medical-shimmer" />
            <div className="h-8 w-48 rounded-lg animate-medical-shimmer" />
          </div>
          <div className="h-10 rounded-lg animate-medical-shimmer" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg animate-medical-shimmer" />
          ))}
        </div>
      )}

      {variant === 'form' && (
        <div className="space-y-4">
          <div className="h-6 w-56 rounded-md animate-medical-shimmer" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-medical-shimmer" />
            ))}
          </div>
          <div className="h-12 rounded-xl animate-medical-shimmer" />
        </div>
      )}

      {variant === 'card' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 w-36 rounded-md animate-medical-shimmer" />
            <div className="h-5 w-20 rounded-full animate-medical-shimmer" />
          </div>
          <div className="h-10 w-28 rounded-lg animate-medical-shimmer" />
          <div className="h-4 w-full rounded-md animate-medical-shimmer" />
          <div className="h-4 w-3/4 rounded-md animate-medical-shimmer" />
        </div>
      )}
    </div>
  );
}
