import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, XCircle } from 'lucide-react';

const sampleCsv = `Date,Description,Category,Amount,Account\n2025-09-01,Salary,Income,120000,Checking\n2025-09-02,Coffee,Wants,-180,Card\n2025-09-03,Rent,Needs,-35000,Checking\n2025-09-04,Index Fund,Investments,-8000,Card\n2025-09-05,Savings Transfer,Savings,-10000,Checking\n2025-09-06,Electricity,Needs,-2200,Card\n2025-09-06,Food Delivery,Wants,-750,Card\n`;

const UploadModule = ({ onData }) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const parseCsv = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(',');
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i];
      });
      return obj;
    });
    return { headers, rows };
  };

  const handleFile = async (file) => {
    try {
      setError('');
      setFileName(file.name);
      const result = await parseCsv(file);
      onData?.(result);
    } catch (e) {
      setError('Failed to parse CSV. Please check the format.');
    }
  };

  return (
    <section id="upload" className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Upload your bank statement</h2>
            <p className="mt-2 text-slate-600">
              We process your data locally in the browser for this demo. You can
              also try with a sample dataset to preview the experience.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow transition hover:bg-emerald-700"
              >
                <UploadCloud className="h-5 w-5" /> Choose CSV
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([sampleCsv], { type: 'text/csv' });
                  const file = new File([blob], 'sample_finscope.csv', { type: 'text/csv' });
                  handleFile(file);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
              >
                <FileSpreadsheet className="h-5 w-5" /> Use sample data
              </button>
            </div>
            {fileName && (
              <p className="mt-3 text-sm text-slate-500">Loaded: {fileName}</p>
            )}
            {error && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                <XCircle className="h-4 w-4" /> {error}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default UploadModule;
