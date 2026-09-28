'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, Download } from 'lucide-react';

interface CsvChunkUploaderProps {
  endpoint: '/api/mcu/upload' | '/api/dcu/upload';
  title: string;
  description: string;
  chunkSize?: number; // Jumlah baris per batch payload ke Vercel (default: 200 baris)
  onSuccess?: () => void;
}

export function CsvChunkUploader({
  endpoint,
  title,
  description,
  chunkSize = 200,
  onSuccess
}: CsvChunkUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [uploadedRows, setUploadedRows] = useState(0);
  const [errorsList, setErrorsList] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setErrorsList([]);
    setStatusMessage('Membaca berkas CSV di peramban...');

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        setTotalRows(rows.length);
        setStatusMessage(`Memulai unggah bertahap (${rows.length} baris)...`);

        let successCount = 0;
        const accumulatedErrors: any[] = [];

        // Chunking loop untuk mematuhi batas ukuran request body Vercel (< 4.5 MB)
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(chunk)
            });

            const data = await res.json();
            if (data.success) {
              successCount += data.validCount || chunk.length;
              if (data.errors && data.errors.length > 0) {
                accumulatedErrors.push(...data.errors);
              }
            } else {
              accumulatedErrors.push({ row: i, message: data.message || 'Gagal memproses batch' });
            }
          } catch (err: any) {
            accumulatedErrors.push({ row: i, message: 'Kesalahan jaringan: ' + err.message });
          }

          const currentDone = Math.min(rows.length, i + chunkSize);
          setUploadedRows(currentDone);
          setProgress(Math.round((currentDone / rows.length) * 100));
        }

        setIsProcessing(false);
        setErrorsList(accumulatedErrors);
        setStatusMessage(`Selesai: ${successCount} berhasil diproses. ${accumulatedErrors.length} baris bermasalah.`);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        setIsProcessing(false);
        setStatusMessage('Gagal membaca berkas CSV: ' + err.message);
      }
    });
  };

  const downloadErrorReport = () => {
    if (errorsList.length === 0) return;
    const blob = new Blob([JSON.stringify(errorsList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/70 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40 relative">
        <input 
          type="file" 
          accept=".csv" 
          disabled={isProcessing}
          onChange={handleFileChange} 
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          ) : (
            <FileText className="h-8 w-8 text-slate-400" />
          )}
          <span className="text-xs text-slate-200 font-medium">
            {isProcessing ? 'Sedang memproses batch chunking...' : 'Klik atau seret berkas CSV ke sini'}
          </span>
          <span className="text-[11px] text-slate-500">
            Parsing client-side dengan PapaParse (Mendukung hingga 10.000+ baris)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{uploadedRows} / {totalRows} baris</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Feedback */}
      {statusMessage && (
        <div className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
          errorsList.length > 0 
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' 
            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {errorsList.length > 0 ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage}</span>
          </div>

          {errorsList.length > 0 && (
            <button 
              onClick={downloadErrorReport}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-900/50 hover:bg-amber-800 border border-amber-700/60 rounded-md transition flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Unduh Laporan Error ({errorsList.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
