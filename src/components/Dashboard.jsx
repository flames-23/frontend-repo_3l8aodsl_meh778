import React from 'react';
import { TrendingUp, Wallet, PiggyBank, CreditCard } from 'lucide-react';

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
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <path
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth="3.8"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-emerald-500"
          stroke="currentColor"
          strokeWidth="3.8"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-slate-900">{pct}</div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Health Score</div>
        </div>
      </div>
    </div>
  );
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

  return (
    <section id="dashboard" className="mx-auto max-w-6xl px-6 pb-16">
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

export default Dashboard;
