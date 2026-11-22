import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  BudgetAlert,
  Category,
  FinancialSummary,
  RecurringBill,
  SavingsGoal,
  Transaction,
  WorkspaceSection,
} from '../types/finance';
import { formatCurrency } from '../utils/exportReports';

interface OverviewViewProps {
  transactions: Transaction[];
  categories: Category[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  overallSummary: FinancialSummary;
  activeMonthSummary: FinancialSummary;
  activeMonthKey: string;
  budgetAlerts: BudgetAlert[];
  darkTheme: boolean;
  onNavigate: (section: WorkspaceSection) => void;
  onPayBill: (billId: string) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DARK_CATEGORY_COLOR_MAP: Record<string, string> = {
  '#0F766E': '#14B8A6',
  '#0284C7': '#38BDF8',
  '#D97706': '#F59E0B',
  '#7C3AED': '#A78BFA',
  '#2563EB': '#60A5FA',
  '#059669': '#34D399',
  '#DC2626': '#F87171',
  '#475569': '#94A3B8',
};

function formatMonthLabel(ym: string): string {
  if (ym === 'ALL') return 'All Months';
  const [year, month] = ym.split('-').map(Number);
  if (!year || !month) return ym;
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: CustomTooltipPayloadItem[];
}

const ChartTooltipBox: React.FC<CustomTooltipProps & { mode: 'pie' | 'bar' | 'trend' }> = ({
  active,
  label,
  payload,
  mode,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  if (mode === 'pie') {
    const item = payload[0];
    const pct = Number((item.payload as { percent?: number } | undefined)?.percent ?? 0);
    return (
      <div className="rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
          {item.name}
        </p>
        <p className="mt-1 font-mono tabular-nums text-slate-700 dark:text-neutral-200">
          {formatCurrency(Number(item.value ?? 0))}{' '}
          <span className="text-slate-500 dark:text-neutral-400">({pct.toFixed(1)}%)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 px-3 py-2.5 shadow-lg text-xs space-y-1.5 min-w-40">
      <p className="font-semibold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={`${entry.name}-${idx}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
              <span
                className="w-2 h-2 rounded-xs shrink-0 border border-black/10 dark:border-white/20"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  transactions,
  categories,
  bills,
  goals,
  overallSummary,
  activeMonthSummary,
  activeMonthKey,
  budgetAlerts,
  darkTheme,
  onNavigate,
  onPayBill,
}) => {
  const [pieMonth, setPieMonth] = useState<string>(activeMonthKey);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [monthlyChartMode, setMonthlyChartMode] = useState<'bar' | 'trend'>('bar');

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const tx of transactions) {
      set.add(tx.date.slice(0, 7));
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const effectivePieMonth =
    pieMonth === 'ALL' || availableMonths.includes(pieMonth) ? pieMonth : activeMonthKey;

  const categoryPieData = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') continue;
      if (effectivePieMonth !== 'ALL' && !tx.date.startsWith(effectivePieMonth)) continue;
      totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
      grandTotal += tx.amount;
    }
    return Array.from(totals.entries())
      .map(([catId, value]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name ?? 'Other',
          value: Number(value.toFixed(2)),
          percent: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
          color: cat?.colorHex ?? '#64748B',
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        renderColor: darkTheme
          ? (DARK_CATEGORY_COLOR_MAP[item.color] ?? item.color)
          : item.color,
      }));
  }, [transactions, effectivePieMonth, categoryMap, darkTheme]);

  const pieTotal = useMemo(
    () => categoryPieData.reduce((sum, item) => sum + item.value, 0),
    [categoryPieData]
  );

  const activePieSlice =
    hoveredPieIndex !== null && categoryPieData[hoveredPieIndex]
      ? categoryPieData[hoveredPieIndex]
      : null;

  const monthlySeriesData = useMemo(() => {
    const grouped = new Map<string, { month: string; income: number; expense: number }>();
    for (const tx of transactions) {
      const ym = tx.date.slice(0, 7);
      const entry = grouped.get(ym) ?? { month: ym, income: 0, expense: 0 };
      if (tx.type === 'INCOME') entry.income += tx.amount;
      else entry.expense += tx.amount;
      grouped.set(ym, entry);
    }
    let runningBalance = 0;
    return Array.from(grouped.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => {
        const net = item.income - item.expense;
        runningBalance += net;
        return {
          label: formatMonthLabel(item.month),
          Income: Number(item.income.toFixed(2)),
          Expenses: Number(item.expense.toFixed(2)),
          'Net Savings': Number(net.toFixed(2)),
          'Cumulative Balance': Number(runningBalance.toFixed(2)),
        };
      });
  }, [transactions]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions]
  );

  const upcomingBills = useMemo(
    () => [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4),
    [bills]
  );

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  const axisTextColor = darkTheme ? '#A3A3A3' : '#475569';
  const gridStroke = darkTheme ? '#262626' : '#E2E8F0';
  const hoverCursorFill = darkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)';

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Real-time balance, {formatMonthLabel(activeMonthKey)} cash flow, and active category limits.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono tabular-nums">
          All-time balance: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(overallSummary.netBalance)}</span>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Key Financial Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-neutral-800 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800"
      >
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            Net Balance ({formatMonthLabel(activeMonthKey)})
          </p>
          <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(activeMonthSummary.netBalance)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-neutral-400">
            {activeMonthSummary.netBalance >= 0 ? 'Positive monthly surplus' : 'Monthly deficit'}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            Monthly Income
          </p>
          <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatCurrency(activeMonthSummary.totalIncome)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-neutral-400">
            All-time: <span className="font-mono tabular-nums">{formatCurrency(overallSummary.totalIncome)}</span>
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            Monthly Expenses
          </p>
          <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-rose-700 dark:text-rose-400">
            {formatCurrency(activeMonthSummary.totalExpense)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-neutral-400">
            All-time: <span className="font-mono tabular-nums">{formatCurrency(overallSummary.totalExpense)}</span>
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            Net Savings Rate
          </p>
          <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-teal-700 dark:text-white">
            {activeMonthSummary.savingsRatePercent.toFixed(1)}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-neutral-400">
            Goals funded: <span className="font-mono tabular-nums">{formatCurrency(totalSaved)} / {formatCurrency(totalGoalTarget)}</span>
          </p>
        </div>
      </section>

      {/* Overspending & Threshold Alerts */}
      {budgetAlerts.length > 0 && (
        <section
          aria-label="Budget Alerts"
          className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-white shrink-0" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Active Budget Alerts <span className="font-mono tabular-nums">({budgetAlerts.length})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('budgets')}
              className="text-xs font-medium text-teal-700 dark:text-white hover:underline whitespace-nowrap"
            >
              Adjust limits
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-neutral-800">
            {budgetAlerts.map((alert) => {
              const isOver = alert.severity === 'EXCEEDED';
              const delta = alert.spent - alert.limit;
              return (
                <div key={alert.categoryId} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200">
                    <span className="font-medium">{alert.categoryName}</span>
                    <span className="text-slate-400 dark:text-neutral-600" aria-hidden="true">·</span>
                    <span
                      className={
                        isOver
                          ? 'font-semibold text-red-700 dark:text-white'
                          : 'font-medium text-amber-700 dark:text-neutral-300'
                      }
                    >
                      {isOver
                        ? <>Over budget by <span className="font-mono tabular-nums">{formatCurrency(delta)}</span></>
                        : <>Approaching limit (<span className="font-mono tabular-nums">{Math.round(alert.ratio * 100)}%</span> used)</>}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs text-slate-600 dark:text-neutral-400">
                    {formatCurrency(alert.spent)} / {formatCurrency(alert.limit)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Graphs & Charts Row */}
      <section aria-label="Financial Charts" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Category-Wise Donut Pie Chart */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-6 flex flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Expenses by Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Hover a slice or row to inspect share
              </p>
            </div>
            <select
              aria-label="Select month for category breakdown"
              value={effectivePieMonth}
              onChange={(e) => {
                setPieMonth(e.target.value);
                setHoveredPieIndex(null);
              }}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white shrink-0"
            >
              <option value="ALL">All Months</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          {categoryPieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-sm text-slate-500 dark:text-neutral-400">
              No expenses recorded for this period.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="relative h-60 w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={94}
                      paddingAngle={2}
                      stroke={darkTheme ? '#0A0A0A' : '#FFFFFF'}
                      strokeWidth={2}
                      onMouseEnter={(_, idx) => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    >
                      {categoryPieData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={entry.renderColor}
                          fillOpacity={hoveredPieIndex === null || hoveredPieIndex === idx ? 1 : 0.35}
                          className="transition-opacity duration-150 outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipBox mode="pie" />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered Dynamic Donut Metric */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-28">
                    {activePieSlice ? activePieSlice.name : formatMonthLabel(effectivePieMonth)}
                  </span>
                  <span className="mt-0.5 text-base font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(activePieSlice ? activePieSlice.value : pieTotal)}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-neutral-400">
                    {activePieSlice ? `${activePieSlice.percent.toFixed(1)}%` : 'Total Spent'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-neutral-800/80 text-xs">
                {categoryPieData.map((item, idx) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredPieIndex(idx)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                    className={`py-1.5 px-1.5 -mx-1.5 rounded-md flex items-center justify-between gap-2 transition-colors ${
                      hoveredPieIndex === idx ? 'bg-slate-100 dark:bg-neutral-900' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0 border border-black/10 dark:border-white/20"
                        style={{ backgroundColor: item.renderColor }}
                      />
                      <span className="text-slate-700 dark:text-neutral-300 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                      <span className="text-slate-500 dark:text-neutral-500">
                        {item.percent.toFixed(1)}%
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white w-20 text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Bar Chart & Net Savings Trend Graph */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-6 flex flex-col justify-between">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {monthlyChartMode === 'bar' ? 'Monthly Income vs. Expenses' : 'Net Savings & Cumulative Balance'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {monthlyChartMode === 'bar'
                  ? 'Side-by-side monthly cash flow comparison'
                  : 'Monthly surplus and running balance trajectory'}
              </p>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-neutral-900 shrink-0 self-start">
              <button
                type="button"
                onClick={() => setMonthlyChartMode('bar')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  monthlyChartMode === 'bar'
                    ? 'bg-white dark:bg-white text-slate-900 dark:text-black shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bar Chart
              </button>
              <button
                type="button"
                onClick={() => setMonthlyChartMode('trend')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  monthlyChartMode === 'trend'
                    ? 'bg-white dark:bg-white text-slate-900 dark:text-black shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Trend Graph
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            {monthlyChartMode === 'bar' ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlySeriesData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: hoverCursorFill }}
                    content={<ChartTooltipBox mode="bar" />}
                  />
                  <Bar
                    dataKey="Income"
                    fill={darkTheme ? '#10B981' : '#0D9488'}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="Expenses"
                    fill={darkTheme ? '#F43F5E' : '#E11D48'}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlySeriesData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                  <defs>
                    <linearGradient id="balanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={darkTheme ? '#14B8A6' : '#0F766E'}
                        stopOpacity={darkTheme ? 0.3 : 0.22}
                      />
                      <stop
                        offset="95%"
                        stopColor={darkTheme ? '#14B8A6' : '#0F766E'}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{ stroke: darkTheme ? '#525252' : '#CBD5E1', strokeDasharray: '3 3' }}
                    content={<ChartTooltipBox mode="trend" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cumulative Balance"
                    stroke={darkTheme ? '#14B8A6' : '#0F766E'}
                    strokeWidth={2}
                    fill="url(#balanceAreaFill)"
                    dot={{ r: 3.5, fill: darkTheme ? '#14B8A6' : '#0F766E', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: darkTheme ? '#14B8A6' : '#0F766E' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Net Savings"
                    stroke={darkTheme ? '#F59E0B' : '#D97706'}
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    fill="none"
                    dot={{ r: 3, fill: darkTheme ? '#F59E0B' : '#D97706', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean Chart Legend Footer */}
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-neutral-400">
            {monthlyChartMode === 'bar' ? (
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-emerald-500" />
                  Income
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 dark:bg-rose-500" />
                  Expenses
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-teal-700 dark:bg-teal-400" />
                  Cumulative Balance
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 border-t border-dashed border-amber-600 dark:border-amber-400" />
                  Monthly Net Savings
                </span>
              </div>
            )}
            <span className="font-mono tabular-nums text-slate-500 dark:text-neutral-500">
              {monthlySeriesData.length} months shown
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Split: Recent Transactions & Upcoming Recurring Bills */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-white hover:underline whitespace-nowrap"
            >
              Open full ledger
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400">
                  <th className="pb-2.5 font-medium">Description</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80 text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/70">
                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                      {tx.title}
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-600 dark:text-neutral-400">
                      {categoryMap.get(tx.categoryId)?.name ?? 'Other'}
                    </td>
                    <td className="py-2.5 pr-3 text-xs font-mono tabular-nums text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono tabular-nums font-medium whitespace-nowrap ${
                        tx.type === 'INCOME'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Recurring Bills
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('bills-goals')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-white hover:underline whitespace-nowrap"
            >
              Manage bills
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-neutral-800/80">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {bill.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-mono tabular-nums">
                    Due {bill.dueDate} · {bill.frequency.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono tabular-nums font-medium text-slate-900 dark:text-white">
                    {formatCurrency(bill.amount)}
                  </span>
                  {bill.paidForCycle ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPayBill(bill.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
                    >
                      Pay & Log
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
