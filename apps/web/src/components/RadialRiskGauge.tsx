'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle 
} from 'lucide-react';

export interface RadialRiskGaugeProps {
  scorePercent: number; // e.g. 18.5
  confidenceInterval?: { lower: number; upper: number }; // e.g. { lower: 16.2, upper: 21.4 }
  label?: string; // e.g. "Skor Risiko Kardiovaskular 10-Tahun"
  subtitle?: string; // e.g. "WHO SEARO 2019 + Multimodal AI"
  size?: 'sm' | 'md' | 'lg';
}

export function RadialRiskGauge({
  scorePercent,
  confidenceInterval,
  label = 'Prediksi Risiko Kardiovaskular 10-Tahun',
  subtitle = 'WHO SEARO 2019 + Multimodal AI',
  size = 'md'
}: RadialRiskGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState<number>(0);

  // Determine risk category & colorblind-safe dual-channel tokens
  let category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let categoryLabel = 'RISIKO RENDAH';
  let strokeColor = '#0D9488'; // Medical Teal
  let badgeBg = 'bg-teal-50 text-teal-800 border-teal-200';
  let IconComponent = CheckCircle2;

  if (scorePercent >= 30.0) {
    category = 'CRITICAL';
    categoryLabel = 'RISIKO KRITIS';
    strokeColor = '#BE123C'; // Crimson Red
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
    IconComponent = ShieldAlert;
  } else if (scorePercent >= 20.0) {
    category = 'HIGH';
    categoryLabel = 'RISIKO TINGGI';
    strokeColor = '#EA580C'; // Tangerine Orange
    badgeBg = 'bg-orange-50 text-orange-800 border-orange-200';
    IconComponent = AlertTriangle;
  } else if (scorePercent >= 10.0) {
    category = 'MODERATE';
    categoryLabel = 'RISIKO SEDANG';
    strokeColor = '#D97706'; // Amber Yellow
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    IconComponent = AlertCircle;
  }

  // Semicircle dimensions:
  // Arc radius R = 75, circumference of full circle = 2 * PI * 75 ≈ 471.24
  // Semicircle arc length = PI * 75 ≈ 235.62
  const radius = 75;
  const arcLength = Math.PI * radius; // 235.62
  // Max scale is 40% risk for visualization cap
  const maxScale = 40;
  const clampedPercent = Math.min(Math.max(scorePercent, 0), maxScale);
  const fillFraction = clampedPercent / maxScale;
  const strokeDashoffset = arcLength - fillFraction * arcLength;

  // Mount animation for count-up
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = category === 'CRITICAL' || category === 'HIGH' ? 650 : 500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Gentle ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(scorePercent * eased * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setAnimatedValue(scorePercent);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [scorePercent, category]);

  // Dimensions based on size
  const svgWidth = size === 'sm' ? 180 : size === 'lg' ? 260 : 220;
  const svgHeight = size === 'sm' ? 110 : size === 'lg' ? 155 : 130;

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-slate-300 transition-colors"
      role="region"
      aria-label={`Skor risiko kardiovaskular ${scorePercent} persen, kategori ${categoryLabel}`}
    >
      {/* Header Info */}
      <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-100">
        <span className="font-bold text-slate-800 tracking-tight text-left">
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {subtitle}
        </span>
      </div>

      {/* Semicircle SVG Gauge */}
      <div className="relative my-3 flex flex-col items-center">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox="0 0 200 115" 
          className="overflow-visible"
        >
          {/* Background track arc (180deg) */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Tick markers at 10% and 20% */}
          <line x1="47" y1="52" x2="41" y2="46" stroke="#94A3B8" strokeWidth="2" />
          <line x1="100" y1="30" x2="100" y2="22" stroke="#94A3B8" strokeWidth="2" />

          {/* Active colored arc */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-medical-gauge"
          />
        </svg>

        {/* Center Text Metrics */}
        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
            {animatedValue.toFixed(1)}
            <span className="text-xl sm:text-2xl font-bold font-sans text-slate-600 ml-0.5">%</span>
          </div>

          {/* Dual-Channel Category Badge */}
          <div className={`mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeBg}`}>
            <IconComponent className="w-3.5 h-3.5 shrink-0" />
            <span>{categoryLabel}</span>
          </div>
        </div>
      </div>

      {/* Semicircle Ticks Labels */}
      <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono px-3 -mt-1">
        <span>0% (Aman)</span>
        <span className="pl-4">10%</span>
        <span>20% (Tinggi)</span>
        <span>&ge;40%</span>
      </div>

      {/* Footer: Confidence Interval & Timestamp */}
      <div className="w-full mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1 font-sans">
        {confidenceInterval ? (
          <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            95% CI: <strong className="text-slate-800">{confidenceInterval.lower}% – {confidenceInterval.upper}%</strong>
          </span>
        ) : (
          <span className="text-slate-400">Kalibrasi: Brier 0.005</span>
        )}
        <span className="text-[10px] text-slate-400">
          Diperbarui: Hari ini
        </span>
      </div>
    </div>
  );
}
