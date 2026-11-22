import React, { useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Target, Trash2 } from 'lucide-react';
import { BillFrequency, Category, RecurringBill, SavingsGoal } from '../types/finance';
import { formatCurrency } from '../utils/exportReports';

interface BillsGoalsViewProps {
  bills: RecurringBill[];
  goals: SavingsGoal[];
  categories: Category[];
  onSaveBill: (bill: Omit<RecurringBill, 'id'> & { id?: string }) => void;
  onDeleteBill: (id: string) => void;
  onPayBill: (billId: string) => void;
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'> & { id?: string }) => void;
  onContributeGoal: (goalId: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

function getDaysUntil(dueDateStr: string): number {
  const today = new Date('2026-11-21T00:00:00Z');
  const due = new Date(`${dueDateStr}T00:00:00Z`);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const BillsGoalsView: React.FC<BillsGoalsViewProps> = ({
  bills,
  goals,
  categories,
  onSaveBill,
  onDeleteBill,
  onPayBill,
  onSaveGoal,
  onContributeGoal,
  onDeleteGoal,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  // Bill Form State
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategoryId, setBillCategoryId] = useState(expenseCategories[0]?.id ?? 'cat-bills');
  const [billDueDate, setBillDueDate] = useState('2026-12-01');
  const [billFreq, setBillFreq] = useState<BillFrequency>('MONTHLY');

  // Goal Form State
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDate, setGoalDate] = useState('2027-05-01');

  // Quick contribution input per goal
  const [customContrib, setCustomContrib] = useState<Record<string, string>>({});

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(billAmount);
    if (!billTitle.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onSaveBill({
      title: billTitle.trim(),
      amount: Number(amount.toFixed(2)),
      categoryId: billCategoryId,
      dueDate: billDueDate,
      frequency: billFreq,
      paidForCycle: false,
    });
    setBillTitle('');
    setBillAmount('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number.parseFloat(goalTarget);
    const current = Number.parseFloat(goalCurrent || '0') || 0;
    if (!goalName.trim() || !Number.isFinite(target) || target <= 0) return;
    onSaveGoal({
      name: goalName.trim(),
      targetAmount: Number(target.toFixed(2)),
      currentAmount: Math.max(0, Number(current.toFixed(2))),
      targetDate: goalDate,
    });
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
  };

  const sortedBills = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Recurring Bills & Savings Goals
        </h1>
        <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
          Track subscription reminders with automatic expense logging and measure progress toward savings targets.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Recurring Bills Column */}
        <section className="xl:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-teal-700 dark:text-white" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recurring Bills & Subscriptions
            </h2>
          </div>

          <form
            onSubmit={handleAddBill}
            className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-4 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="Bill or subscription name"
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="Amount ($)"
                className="px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
              <select
                value={billCategoryId}
                onChange={(e) => setBillCategoryId(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
                />
                <select
                  value={billFreq}
                  onChange={(e) => setBillFreq(e.target.value as BillFrequency)}
                  className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Recurring Bill
              </button>
            </div>
          </form>

          <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800">
            {sortedBills.map((bill) => {
              const days = getDaysUntil(bill.dueDate);
              const dueLabel =
                days < 0
                  ? `Overdue by ${Math.abs(days)}d`
                  : days === 0
                    ? 'Due today'
                    : `Due in ${days} days`;

              return (
                <div key={bill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {bill.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-mono tabular-nums">
                      <span>{bill.dueDate}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span
                        className={
                          days <= 5 && !bill.paidForCycle
                            ? 'text-amber-700 dark:text-white font-semibold'
                            : ''
                        }
                      >
                        {dueLabel}
                      </span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{bill.frequency.toLowerCase()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPayBill(bill.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-white" />
                      Pay & Log
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBill(bill.id)}
                      aria-label={`Delete ${bill.title}`}
                      className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-neutral-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Savings Goals Column */}
        <section className="xl:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-700 dark:text-white" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Savings Goals Tracker
            </h2>
          </div>

          <form
            onSubmit={handleAddGoal}
            className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-4 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Goal title (e.g. Tuition Fund)"
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
              <input
                type="number"
                step="10"
                min="1"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target amount ($)"
                className="px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
              <input
                type="number"
                step="10"
                min="0"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                placeholder="Initial saved ($)"
                className="px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Savings Goal
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {goals.map((goal) => {
              const ratio = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
              const pct = Math.min(100, Math.round(ratio * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const val = customContrib[goal.id] ?? '';

              return (
                <div
                  key={goal.id}
                  className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono tabular-nums mt-0.5">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        Target {goal.targetDate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete ${goal.name}`}
                      className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-neutral-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 dark:bg-white transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">
                      <span>
                        {remaining === 0
                          ? 'Target reached'
                          : `${formatCurrency(remaining)} remaining`}
                      </span>
                      <span className="font-mono tabular-nums font-medium dark:text-white">{pct}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onContributeGoal(goal.id, 50)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap font-mono tabular-nums"
                    >
                      + $50
                    </button>
                    <button
                      type="button"
                      onClick={() => onContributeGoal(goal.id, 100)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap font-mono tabular-nums"
                    >
                      + $100
                    </button>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={val}
                        onChange={(e) =>
                          setCustomContrib((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        placeholder="Custom $"
                        className="w-24 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const num = Number.parseFloat(val);
                          if (Number.isFinite(num) && num > 0) {
                            onContributeGoal(goal.id, num);
                            setCustomContrib((prev) => ({ ...prev, [goal.id]: '' }));
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
