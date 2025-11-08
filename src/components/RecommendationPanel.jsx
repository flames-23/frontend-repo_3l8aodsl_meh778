import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, Calculator } from 'lucide-react';

const RecommendationPanel = ({ data }) => {
  const [reduction, setReduction] = useState(10); // % reduction to simulate on wants

  const { monthlySavingsDelta, forecast } = useMemo(() => simulate(data, reduction), [data, reduction]);

  if (!data || !data.rows?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-emerald-600" /> AI Recommendation Simulator
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <Calculator className="h-4 w-4 text-slate-500" />
            Reduce discretionary by
            <input
              type="number"
              min={0}
              max={80}
              value={reduction}
              onChange={(e) => setReduction(Number(e.target.value))}
              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-right text-slate-700"
            />
            %
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100">
            <div className="text-sm">Estimated monthly savings boost</div>
            <div className="mt-1 text-2xl font-bold">₹{Math.round(monthlySavingsDelta).toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-xl bg-sky-50 p-5 text-sky-900 ring-1 ring-sky-100">
            <div className="text-sm">Projected 12-month savings</div>
            <div className="mt-1 text-2xl font-bold">₹{Math.round(forecast.twelve).toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-xl bg-violet-50 p-5 text-violet-900 ring-1 ring-violet-100">
            <div className="text-sm">Projected 36-month savings</div>
            <div className="mt-1 text-2xl font-bold">₹{Math.round(forecast.thirtySix).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Tip: Trimming food delivery, dining out, and impulse shopping by {reduction}% could free up this cash flow. Automate the difference into your savings or investments.
        </p>

        <a href="#upload" className="mt-4 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800">
          Explore more actions <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
};

function simulate(data, reductionPct) {
  if (!data || !data.rows?.length) return { monthlySavingsDelta: 0, forecast: { twelve: 0, thirtySix: 0 } };
  // Estimate wants spend and potential reduction
  let wants = 0;
  let income = 0;
  data.rows.forEach((r) => {
    const amt = Number(r.Amount);
    const desc = (r.Description || '').toLowerCase();
    const cat = (r.Category || '').toLowerCase();
    if (amt > 0 || cat.includes('income') || desc.includes('salary')) income += amt;
    else if (cat.includes('food') || cat.includes('dining') || cat.includes('entertain') || cat.includes('shopping') || (amt < 0 && !cat && !desc.includes('rent') && !desc.includes('electric'))) wants += Math.abs(amt);
  });
  const monthlySavingsDelta = (wants * reductionPct) / 100;
  const forecast = {
    twelve: monthlySavingsDelta * 12,
    thirtySix: monthlySavingsDelta * 36,
  };
  return { monthlySavingsDelta, forecast };
}

export default RecommendationPanel;
