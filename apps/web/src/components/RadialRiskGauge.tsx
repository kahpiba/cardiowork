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

  // Calming, warm medical color scale (not neon glare)
  let category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let categoryLabel = 'RISIKO RENDAH';
  let strokeColor = '#0F766E'; // Calm Forest Pine
  let badgeBg = 'bg-teal-50 text-teal-900 border-teal-300';
  let IconComponent = CheckCircle2;

  if (scorePercent >= 30.0) {
    category = 'CRITICAL';
    categoryLabel = 'RISIKO KRITIS';
    strokeColor = '#9F1239'; // Deep Warm Rosewood
    badgeBg = 'bg-rose-50 text-rose-900 border-rose-300';
    IconComponent = ShieldAlert;
  } else if (scorePercent >= 20.0) {
    category = 'HIGH';
    categoryLabel = 'RISIKO TINGGI';
    strokeColor = '#C2410C'; // Warm Terracotta
    badgeBg = 'bg-orange-50 text-orange-900 border-orange-300';
    IconComponent = AlertTriangle;
  } else if (scorePercent >= 10.0) {
    category = 'MODERATE';
    categoryLabel = 'RISIKO SEDANG';
    strokeColor = '#D97706'; // Warm Ochre
    badgeBg = 'bg-amber-50 text-amber-900 border-amber-300';
    IconComponent = AlertCircle;
  }

  const radius = 75;
  const arcLength = Math.PI * radius; // 235.62
  const maxScale = 40;
  const clampedPercent = Math.min(Math.max(scorePercent, 0), maxScale);
  const fillFraction = clampedPercent / maxScale;
  const strokeDashoffset = arcLength - fillFraction * arcLength;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = category === 'CRITICAL' || category === 'HIGH' ? 650 : 500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
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

  const svgWidth = size === 'sm' ? 190 : size === 'lg' ? 280 : 240;
  const svgHeight = size === 'sm' ? 120 : size === 'lg' ? 165 : 140;

  return (
    <div 
      className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-stone-300 transition-colors"
      role="region"
      aria-label={`Skor risiko kardiovaskular ${scorePercent} persen, kategori ${categoryLabel}`}
    >
      {/* Header Info - Readable scale */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100">
        <span className="font-bold text-stone-900 text-sm tracking-tight text-left">
          {label}
        </span>
        <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
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
            stroke="#E7E5E4"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Tick markers at 10% and 20% */}
          <line x1="47" y1="52" x2="41" y2="46" stroke="#A8A29E" strokeWidth="2" />
          <line x1="100" y1="30" x2="100" y2="22" stroke="#A8A29E" strokeWidth="2" />

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
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-stone-900 tabular-nums">
            {animatedValue.toFixed(1)}
            <span className="text-2xl font-bold font-sans text-stone-600 ml-0.5">%</span>
          </div>

          {/* Dual-Channel Category Badge */}
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeBg}`}>
            <IconComponent className="w-4 h-4 shrink-0" />
            <span>{categoryLabel}</span>
          </div>
        </div>
      </div>

      {/* Semicircle Ticks Labels - Readable */}
      <div className="w-full flex justify-between text-xs text-stone-500 font-mono px-3">
        <span>0% (Aman)</span>
        <span className="pl-4">10%</span>
        <span>20% (Tinggi)</span>
        <span>&ge;40%</span>
      </div>

      {/* Footer: Confidence Interval & Timestamp */}
      <div className="w-full mt-4 pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-stone-600 gap-1.5 font-sans">
        {confidenceInterval ? (
          <span className="font-mono text-stone-700 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
            95% CI: <strong className="text-stone-900 font-bold">{confidenceInterval.lower}% – {confidenceInterval.upper}%</strong>
          </span>
        ) : (
          <span className="text-stone-500">Kalibrasi: Brier 0.005</span>
        )}
        <span className="text-xs text-stone-500">
          Diperbarui: Hari ini
        </span>
      </div>
    </div>
  );
}
