import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, Calculator, Wand2, Scale } from 'lucide-react';

const RecommendationPanel = ({ data }) => {
  const [reduction, setReduction] = useState(10); // % reduction to simulate on wants
  const [sip, setSip] = useState(5000); // monthly SIP amount
  const [roi, setRoi] = useState(10); // expected annual return %

  const { monthlySavingsDelta, forecast } = useMemo(() => simulate(data, reduction), [data, reduction]);
  const sipGrowth = useMemo(() => calcSipFutureValue(sip, roi, 12 * 10), [sip, roi]);
  const runway = useMemo(() => calcEmergencyRunway(data), [data]);

  if (!data || !data.rows?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-emerald-600" /> AI Recommendation Simulator
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
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
            <span className="ml-4 inline-flex items-center gap-2"><Wand2 className="h-4 w-4 text-violet-600" /> SIP</span>
            ₹
            <input
              type="number"
              min={0}
              value={sip}
              onChange={(e) => setSip(Number(e.target.value))}
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-slate-700"
            />
            @
            <input
              type="number"
              min={0}
              max={20}
              value={roi}
              onChange={(e) => setRoi(Number(e.target.value))}
              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-right text-slate-700"
            />
            % CAGR
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard title="Estimated monthly savings boost" value={`₹${Math.round(monthlySavingsDelta).toLocaleString('en-IN')}`} color="emerald" />
          <InfoCard title="Projected 12-month savings" value={`₹${Math.round(forecast.twelve).toLocaleString('en-IN')}`} color="sky" />
          <InfoCard title="Projected 36-month savings" value={`₹${Math.round(forecast.thirtySix).toLocaleString('en-IN')}`} color="violet" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
            <div className="text-sm font-semibold text-slate-700">Emergency Runway</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{runway.months} months</div>
            <p className="mt-2 text-sm text-slate-600">Cushion based on your average essential spend and savings buffer.</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (runway.months / 6) * 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">Target: 6+ months</div>
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
            <div className="text-sm font-semibold text-slate-700">SIP 10-year Projection</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">₹{sipGrowth.toLocaleString('en-IN')}</div>
            <p className="mt-2 text-sm text-slate-600">Monthly SIP compounded at {roi}% annually over 10 years.</p>
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Scale className="h-4 w-4 text-emerald-600"/> Allocation Tip</div>
            <p className="mt-2 text-sm text-slate-600">Shift {Math.min(20, reduction)}% from non-essentials to SIP to accelerate wealth creation without impacting essentials.</p>
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

function calcSipFutureValue(monthly, annualRatePct, periods) {
  const r = annualRatePct / 100 / 12;
  // FV of ordinary annuity: P * [((1+r)^n - 1) / r]
  const fv = r > 0 ? monthly * ((Math.pow(1 + r, periods) - 1) / r) : monthly * periods;
  return Math.round(fv);
}

function calcEmergencyRunway(data) {
  if (!data || !data.rows?.length) return { months: 0 };
  // Compute average essential spend (Needs + Debts) per month and inferred buffer from Savings rows
  const months = new Map();
  let savingsBuffer = 0;
  data.rows.forEach((r) => {
    const amt = Number(r.Amount);
    const desc = (r.Description || '').toLowerCase();
    const cat = (r.Category || '').toLowerCase();
    const ym = (r.Date || '').slice(0, 7) || 'unknown';
    const isIncome = amt > 0 || cat.includes('income') || desc.includes('salary');
    const isNeeds = cat.includes('rent') || cat.includes('grocer') || cat.includes('bill') || desc.includes('electric') || desc.includes('rent');
    const isDebt = cat.includes('loan') || cat.includes('emi') || desc.includes('loan');
    const isSavings = cat.includes('savings') || desc.includes('savings') || desc.includes('fd');

    const entry = months.get(ym) || { essential: 0 };
    if (!isIncome && (isNeeds || isDebt)) entry.essential += Math.abs(amt);
    months.set(ym, entry);

    if (isSavings && amt < 0) savingsBuffer += Math.abs(amt);
  });
  const arr = Array.from(months.values());
  const avgEssential = arr.length ? arr.reduce((s, m) => s + m.essential, 0) / arr.length : 0;
  const runwayMonths = avgEssential > 0 ? Math.round(savingsBuffer / avgEssential) : 0;
  return { months: runwayMonths };
}

const InfoCard = ({ title, value, color }) => {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    sky: 'bg-sky-50 text-sky-900 ring-sky-100',
    violet: 'bg-violet-50 text-violet-900 ring-violet-100',
  };
  return (
    <div className={`rounded-xl p-5 ring-1 ${map[color]}`}>
      <div className="text-sm">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
};

export default RecommendationPanel;
