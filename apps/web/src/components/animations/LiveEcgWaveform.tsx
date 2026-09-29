'use client';

import React, { useEffect, useRef } from 'react';

interface LiveEcgWaveformProps {
  bpm?: number;
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
}

export const LiveEcgWaveform: React.FC<LiveEcgWaveformProps> = ({
  bpm = 75,
  height = 90,
  color = '#0d9488', // Deep Teal
  className = '',
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Rasio resolusi tinggi retina
    const dpr = window.devicePixelRatio || 1;
    let width = canvas.parentElement?.clientWidth || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let sweepX = 0;
    const speed = 2.2; // Kecepatan sapuan berkas elektron
    const baseline = height / 2;
    const history: number[] = new Array(Math.ceil(width)).fill(baseline);

    // Fungsi sintetis P-Q-R-S-T gelombang elektrokardiogram
    const getEcgSample = (phase: number) => {
      // phase 0 s.d. 1 per detak jantung
      if (phase < 0.12) {
        // P-wave (Depolarisasi Atrium)
        return baseline - Math.sin((phase / 0.12) * Math.PI) * (height * 0.14);
      } else if (phase >= 0.12 && phase < 0.2) {
        // PR segment (Isoelektrik)
        return baseline;
      } else if (phase >= 0.2 && phase < 0.22) {
        // Q-wave (Defleksi negatif awal ventrikel)
        const p = (phase - 0.2) / 0.02;
        return baseline + Math.sin(p * Math.PI) * (height * 0.08);
      } else if (phase >= 0.22 && phase < 0.27) {
        // R-wave (Puncak defleksi positif tinggi ventrikel)
        const p = (phase - 0.22) / 0.05;
        return baseline - Math.sin(p * Math.PI) * (height * 0.42);
      } else if (phase >= 0.27 && phase < 0.30) {
        // S-wave (Defleksi negatif dalam setelah R)
        const p = (phase - 0.27) / 0.03;
        return baseline + Math.sin(p * Math.PI) * (height * 0.16);
      } else if (phase >= 0.30 && phase < 0.42) {
        // ST segment
        return baseline;
      } else if (phase >= 0.42 && phase < 0.62) {
        // T-wave (Repolarisasi Ventrikel)
        const p = (phase - 0.42) / 0.20;
        return baseline - Math.sin(p * Math.PI) * (height * 0.18);
      } else {
        // Isoelectric baseline istirahat s.d. detak berikutnya
        return baseline;
      }
    };

    let beatProgress = 0;
    const samplesPerBeat = (60 / bpm) * (60 / speed);

    const render = () => {
      width = canvas.parentElement?.clientWidth || 600;
      if (canvas.width !== width * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      // Bersihkan frame dengan sapuan lembut
      ctx.clearRect(0, 0, width, height);

      // 1. Gambar Grid Milimeter Kertas Medis
      if (showGrid) {
        ctx.strokeStyle = 'rgba(120, 113, 108, 0.08)'; // warm stone grid
        ctx.lineWidth = 1;
        const gridSize = 16;

        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      // 2. Hitung sampel EKG titik saat ini
      const phase = (beatProgress % samplesPerBeat) / samplesPerBeat;
      const sampleY = getEcgSample(phase);

      const sweepIndex = Math.floor(sweepX);
      history[sweepIndex] = sampleY;

      // 3. Gambar Jejak Gelombang EKG dengan Efek Fosfor Berpendar
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Gambar segmen sebelum sweep point
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      let started = false;
      const eraseWidth = 25; // Area hapus di depan titik sapuan

      for (let x = 0; x < width; x++) {
        // Berikan celah kosong di depan sapuan (gaya monitor kardiak)
        if (x >= sweepX && x < sweepX + eraseWidth) {
          continue;
        }

        const y = history[x] || baseline;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 4. Gambar Titik Berkas Elektron Terdepan (Glowing Head)
      ctx.beginPath();
      ctx.arc(sweepX, sampleY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();

      // Increment
      sweepX = (sweepX + speed) % width;
      beatProgress++;

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [bpm, height, color, showGrid]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-stone-50/50 border border-stone-200/80 shadow-2xs ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
