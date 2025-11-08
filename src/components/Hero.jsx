import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket, Shield, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Gradient overlay for readability, doesn't block interaction */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
          <Shield className="h-4 w-4" /> Privacy-first • No spam, no surprises
        </span>
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
          FinScope — AI Financial Health Scanner
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Know your money like you know your steps. Upload a statement, get your
          Financial Health Score, and actionable tips to improve it — your
          fitness tracker for finances.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#upload"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Rocket className="h-5 w-5" /> Start Analysis
          </a>
          <a
            href="#dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-emerald-700 shadow-md ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            <Star className="h-5 w-5" /> See the dashboard
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
