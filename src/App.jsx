import React, { useState } from 'react';
import Hero from './components/Hero.jsx';
import UploadModule from './components/UploadModule.jsx';
import Dashboard from './components/Dashboard.jsx';
import RecommendationPanel from './components/RecommendationPanel.jsx';

function App() {
  const [parsed, setParsed] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
      <Hero />
      <UploadModule onData={setParsed} />
      <Dashboard data={parsed} />
      <RecommendationPanel data={parsed} />
      <footer className="border-t border-emerald-100 bg-white/70 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">FinScope — AI Financial Health Scanner</p>
          <p className="mt-1">Track. Improve. Grow — your financial fitness starts here.</p>
          <p className="mt-2">This demo processes data locally in your browser. No files are uploaded.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
