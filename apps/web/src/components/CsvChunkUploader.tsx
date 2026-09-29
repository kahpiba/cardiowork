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
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
        <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-800 shadow-2xs">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-stone-900 text-sm">{title}</h3>
          <p className="text-xs text-stone-500">{description}</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-stone-300 hover:border-rose-600 rounded-xl p-8 text-center cursor-pointer transition bg-stone-50/50 hover:bg-rose-50/20 relative group">
        <input 
          type="file" 
          accept=".csv" 
          disabled={isProcessing}
          onChange={handleFileChange} 
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-rose-700 animate-spin" />
          ) : (
            <FileText className="h-8 w-8 text-stone-400 group-hover:text-rose-700 transition-colors" />
          )}
          <span className="text-xs text-stone-700 font-semibold group-hover:text-rose-800 transition-colors">
            {isProcessing ? 'Sedang memproses batch chunking...' : 'Klik atau seret berkas CSV ke sini'}
          </span>
          <span className="text-xs text-stone-500">
            Parsing client-side dengan PapaParse (Mendukung hingga 10.000+ baris)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-600 font-mono">
            <span>{uploadedRows} / {totalRows} baris</span>
            <span className="font-bold text-rose-800">{progress}%</span>
          </div>
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="bg-rose-700 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Feedback */}
      {statusMessage && (
        <div className={`text-xs p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
          errorsList.length > 0 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-2">
            {errorsList.length > 0 ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            )}
            <span className="font-medium">{statusMessage}</span>
          </div>

          {errorsList.length > 0 && (
            <button 
              onClick={downloadErrorReport}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-amber-100 border border-amber-300 rounded-md transition flex items-center space-x-1 text-amber-900 shadow-2xs"
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
