import React, { useMemo } from 'react';
import { TrendingUp, Wallet, PiggyBank, CreditCard, Download, Repeat, Building2 } from 'lucide-react';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const categorize = (rows) => {
  // Simple rule-based categorization based on Description/Category/Amount sign
  const map = { Needs: 0, Wants: 0, Savings: 0, Investments: 0, Debts: 0, Income: 0 };
  const monthly = {};

  rows.forEach((r) => {
    const amt = Number(r.Amount);
    const desc = (r.Description || '').toLowerCase();
    const cat = (r.Category || '').toLowerCase();

    let bucket = 'Wants';
    if (amt > 0 || cat.includes('income') || desc.includes('salary')) bucket = 'Income';
    else if (
      cat.includes('rent') ||
      cat.includes('grocer') ||
      cat.includes('bill') ||
      desc.includes('electric') ||
      desc.includes('rent')
    )
      bucket = 'Needs';
    else if (cat.includes('savings') || desc.includes('savings') || desc.includes('fd')) bucket = 'Savings';
    else if (cat.includes('invest') || desc.includes('fund')) bucket = 'Investments';
    else if (cat.includes('loan') || cat.includes('emi') || desc.includes('loan')) bucket = 'Debts';

    map[bucket] = (map[bucket] || 0) + amt;

    const ym = (r.Date || '').slice(0, 7);
    if (!monthly[ym]) monthly[ym] = { income: 0, expense: 0 };
    if (amt > 0) monthly[ym].income += amt;
    else monthly[ym].expense += Math.abs(amt);
  });

  const totals = {
    income: map['Income'],
    expenses: Math.abs(map['Needs'] + map['Wants'] + map['Savings'] + map['Investments'] + map['Debts']),
    savings: Math.abs(map['Savings']),
    debts: Math.abs(map['Debts']),
  };

  const score = computeScore(totals, map);
  return { map, totals, monthly, score };
};

const computeScore = (totals, map) => {
  const { income, expenses, savings, debts } = totals;
  const savingsRate = income > 0 ? savings / income : 0;
  const debtRatio = income > 0 ? debts / income : 0;
  const nonEssentials = Math.abs(map['Wants']) / Math.max(1, income);

  // Simple 0-100 scoring with weights
  let score = 0;
  score += Math.max(0, 40 * (1 - debtRatio));
  score += Math.min(30, 30 * savingsRate);
  score += Math.max(0, 20 * (1 - nonEssentials));
  score += Math.max(0, 10 * (income > expenses ? 1 : income / Math.max(1, expenses)));
  return Math.round(Math.min(100, Math.max(0, score)));
};

const Gauge = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  const band = pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-sky-500' : pct >= 40 ? 'text-amber-500' : 'text-rose-500';
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Watch';
  return {
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      className: 'relative h-44 w-44',
      children: [
        {
          $$typeof: Symbol.for('react.element'),
          type: 'svg',
          props: {
            viewBox: '0 0 36 36',
            className: 'h-full w-full -rotate-90',
            children: [
              {
                $$typeof: Symbol.for('react.element'),
                type: 'path',
                props: {
                  className: 'text-slate-200',
                  stroke: 'currentColor',
                  strokeWidth: '3.8',
                  fill: 'none',
                  d: 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831',
                },
                key: 'bg',
              },
              {
                $$typeof: Symbol.for('react.element'),
                type: 'path',
                props: {
                  className: band,
                  stroke: 'currentColor',
                  strokeWidth: '3.8',
                  strokeDasharray: `${pct}, 100`,
                  strokeLinecap: 'round',
                  fill: 'none',
                  d: 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831',
                },
                key: 'fg',
              },
            ],
          },
          key: 'svg',
        },
        {
          $$typeof: Symbol.for('react.element'),
          type: 'div',
          props: {
            className: 'absolute inset-0 grid place-items-center',
            children: {
              $$typeof: Symbol.for('react.element'),
              type: 'div',
              props: {
                className: 'text-center',
                children: [
                  {
                    $$typeof: Symbol.for('react.element'),
                    type: 'div',
                    props: { className: 'text-3xl font-extrabold text-slate-900', children: pct },
                    key: 'val',
                  },
                  {
                    $$typeof: Symbol.for('react.element'),
                    type: 'div',
                    props: { className: 'text-xs uppercase tracking-wide text-slate-500', children: 'Health Score' },
                    key: 'label',
                  },
                  {
                    $$typeof: Symbol.for('react.element'),
                    type: 'div',
                    props: { className: 'mt-1 text-[11px] font-medium text-slate-500', children: label },
                    key: 'band',
                  },
                ],
              },
              key: 'center',
            },
          },
          key: 'center-wrap',
        },
      ],
    },
    key: 'root',
  };
};

const Sparkline = ({ points }) => {
  if (!points.length) return null;
  const width = 400;
  const height = 140;
  const maxY = Math.max(...points);
  const minY = Math.min(...points);
  const norm = (v) => (maxY === minY ? height / 2 : height - ((v - minY) / (maxY - minY)) * height);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${norm(v)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="#10b981" strokeWidth="3" />
      <path
        d={`${d} L ${width},${height} L 0,${height} Z`}
        fill="url(#grad)"
        opacity="0.7"
      />
    </svg>
  );
};

const Dashboard = ({ data }) => {
  if (!data || !data.rows?.length) {
    return null;
  }

  const { map, totals, monthly, score } = categorize(data.rows);

  const months = Object.keys(monthly).sort();
  const incomeSeries = months.map((m) => monthly[m].income);
  const expenseSeries = months.map((m) => monthly[m].expense);

  const tips = generateTips(totals, map);

  const breakdown = [
    { label: 'Needs', value: Math.abs(map['Needs']), color: 'bg-sky-400' },
    { label: 'Wants', value: Math.abs(map['Wants']), color: 'bg-amber-500' },
    { label: 'Savings', value: Math.abs(map['Savings']), color: 'bg-emerald-500' },
    { label: 'Investments', value: Math.abs(map['Investments']), color: 'bg-indigo-500' },
    { label: 'Debts', value: Math.abs(map['Debts']), color: 'bg-rose-500' },
  ];
  const breakdownTotal = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  const recurrences = useMemo(() => detectRecurring(data.rows), [data.rows]);
  const topMerchants = useMemo(() => computeTopMerchants(data.rows), [data.rows]);

  const handleExport = () => {
    const report = generateReport({ score, totals, breakdown, tips, months, incomeSeries, expenseSeries, recurrences, topMerchants });
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finscope_report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="dashboard" className="mx-auto max-w-6xl px-6 pb-16">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Dashboard</h2>
          <p className="text-sm text-slate-500">Benchmarks: Savings ≥ 20% • Debt ≤ 30% • Wants ≤ 30%</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="col-span-1 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <Gauge value={score} />
          <p className="mt-4 text-center text-sm text-slate-600">Your financial fitness today</p>
        </div>

        <div className="col-span-3 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Kpi icon={<Wallet className="h-5 w-5 text-emerald-600" />} label="Income" value={currency(totals.income)} />
          <Kpi icon={<CreditCard className="h-5 w-5 text-rose-600" />} label="Expenses" value={currency(totals.expenses)} />
          <Kpi icon={<PiggyBank className="h-5 w-5 text-sky-600" />} label="Savings" value={currency(totals.savings)} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Monthly Income Trend
          </h3>
          <Sparkline points={incomeSeries} />
          <h3 className="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 rotate-180 text-rose-600" /> Monthly Expense Trend
          </h3>
          <Sparkline points={expenseSeries} />
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Spending Breakdown</h3>
          <div className="space-y-3">
            {breakdown.map((b) => {
              const pct = Math.round((b.value / breakdownTotal) * 100);
              return (
                <div key={b.label} className="">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{b.label}</span>
                    <span className="font-medium text-slate-900">{pct}%</span>
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900"><Repeat className="h-5 w-5 text-violet-600" /> Recurring Payments</h3>
          {recurrences.length === 0 ? (
            <p className="text-sm text-slate-500">No recurring payments detected.</p>
          ) : (
            <ul className="space-y-2">
              {recurrences.slice(0, 5).map((r) => (
                <li key={r.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{r.name}</span>
                  <span className="text-slate-500">{r.count}x • {currency(r.avg)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900"><Building2 className="h-5 w-5 text-amber-600" /> Top Merchants/Tags</h3>
          {topMerchants.length === 0 ? (
            <p className="text-sm text-slate-500">No merchants detected.</p>
          ) : (
            <ul className="space-y-2">
              {topMerchants.slice(0, 5).map((m) => (
                <li key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{m.name}</span>
                  <span className="text-slate-500">{currency(m.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {tips.map((t, i) => (
          <TipCard key={i} {...t} />
        ))}
      </div>
    </section>
  );
};

const Kpi = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 ring-1 ring-slate-100">
        {icon}
      </div>
    </div>
  </div>
);

const TipCard = ({ title, body, tag, color }) => {
  const col =
    color === 'red'
      ? 'bg-rose-50 text-rose-700 ring-rose-100'
      : color === 'green'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : 'bg-sky-50 text-sky-700 ring-sky-100';
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-900">{title}</div>
      <p className="text-sm text-slate-600">{body}</p>
      <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ${col}`}>
        {tag}
      </span>
    </div>
  );
};

const generateTips = (totals, map) => {
  const tips = [];
  const income = totals.income || 1;
  const wantsPct = Math.round((Math.abs(map['Wants']) / income) * 100);
  if (wantsPct > 30) {
    tips.push({
      title: 'High non-essential spending',
      body: `You are spending ${wantsPct}% of your income on non-essentials. Target below 30% to improve your score.`,
      tag: 'High Impact',
      color: 'red',
    });
  }
  if (totals.savings < income * 0.2) {
    const gap = Math.round(income * 0.2 - totals.savings);
    tips.push({
      title: 'Boost your savings rate',
      body: `Increase monthly savings by ${currency(gap)} to hit a 20% savings rate.`,
      tag: 'Low Risk',
      color: 'green',
    });
  }
  if (totals.debts > income * 0.3) {
    tips.push({
      title: 'Debt ratio is elevated',
      body: 'Aim to keep EMIs and loans below 30% of income. Consider refinancing or paying down high-interest debt first.',
      tag: 'Priority',
      color: 'red',
    });
  }
  if (tips.length === 0) {
    tips.push({
      title: 'Great balance',
      body: 'Your spending and savings mix looks healthy. Keep the streak going! ',
      tag: 'On Track',
      color: 'blue',
    });
  }
  return tips;
};

function detectRecurring(rows) {
  const m = new Map();
  rows.forEach((r) => {
    const amt = Number(r.Amount);
    if (amt >= 0) return; // expenses only
    const key = normalizeName(r.Description || r.Category || '');
    if (!key) return;
    const entry = m.get(key) || { name: key, count: 0, total: 0 };
    entry.count += 1;
    entry.total += Math.abs(amt);
    m.set(key, entry);
  });
  return Array.from(m.values())
    .filter((e) => e.count >= 3)
    .map((e) => ({ ...e, avg: e.total / e.count }))
    .sort((a, b) => b.total - a.total);
}

function computeTopMerchants(rows) {
  const m = new Map();
  rows.forEach((r) => {
    const amt = Number(r.Amount);
    if (amt >= 0) return; // expenses only
    const key = normalizeName(r.Description || r.Category || '');
    if (!key) return;
    const entry = m.get(key) || { name: key, total: 0 };
    entry.total += Math.abs(amt);
    m.set(key, entry);
  });
  return Array.from(m.values()).sort((a, b) => b.total - a.total);
}

function normalizeName(s) {
  const str = s.toLowerCase();
  return str.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
}

function generateReport({ score, totals, breakdown, tips, months, incomeSeries, expenseSeries, recurrences, topMerchants }) {
  return {
    generatedAt: new Date().toISOString(),
    score,
    totals,
    breakdown: breakdown.map((b) => ({ label: b.label, value: b.value })),
    tips,
    trends: months.map((m, i) => ({ month: m, income: incomeSeries[i], expense: expenseSeries[i] })),
    recurringPayments: recurrences,
    topMerchants,
  };
}

export default Dashboard;
