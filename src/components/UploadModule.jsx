import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, XCircle } from 'lucide-react';

const sampleCsv = `Date,Description,Category,Amount,Account\n2025-09-01,Salary,Income,120000,Checking\n2025-09-02,Coffee,Wants,-180,Card\n2025-09-03,Rent,Needs,-35000,Checking\n2025-09-04,Index Fund,Investments,-8000,Card\n2025-09-05,Savings Transfer,Savings,-10000,Checking\n2025-09-06,Electricity,Needs,-2200,Card\n2025-09-06,Food Delivery,Wants,-750,Card\n`;

const UploadModule = ({ onData }) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      setPreview({ headers: result.headers, rows: result.rows.slice(0, 5) });
      onData?.(result);
    } catch (e) {
      setError('Failed to parse CSV. Please check the format.');
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section id="upload" className="mx-auto max-w-5xl px-6 py-12">
      <div
        className={`rounded-2xl border ${isDragging ? 'border-emerald-300' : 'border-emerald-100'} bg-white p-6 shadow-sm transition-colors`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Upload your bank statement</h2>
            <p className="mt-2 text-slate-600">
              Drag & drop a CSV here or pick a file. We process your data locally in the browser for this demo.
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
          <div className="w-full md:max-w-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">Preview</div>
              {!preview ? (
                <p className="mt-2 text-sm text-slate-500">No file loaded. Drop a CSV or use the sample to see the first 5 rows.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-xs text-slate-600">
                    <thead>
                      <tr>
                        {preview.headers.map((h) => (
                          <th key={h} className="whitespace-nowrap px-2 py-1 font-semibold text-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((r, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-slate-100/50">
                          {preview.headers.map((h) => (
                            <td key={h} className="whitespace-nowrap px-2 py-1">{r[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadModule;
