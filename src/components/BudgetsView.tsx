import React, { useState } from 'react';
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { Category, TransactionType } from '../types/finance';
import { formatCurrency } from '../utils/exportReports';

interface BudgetsViewProps {
  categories: Category[];
  spentByCategoryCurrentMonth: Map<string, number>;
  activeMonthKey: string;
  onSaveCategory: (cat: Omit<Category, 'id'> & { id?: string }) => void;
  onDeleteCategory: (id: string) => void;
}

const COLOR_SWATCHES = [
  '#0F766E',
  '#0284C7',
  '#D97706',
  '#7C3AED',
  '#2563EB',
  '#059669',
  '#DC2626',
  '#475569',
];

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  spentByCategoryCurrentMonth,
  activeMonthKey,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [limit, setLimit] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_SWATCHES[0]);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLimit, setEditLimit] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const totalBudgeted = expenseCategories.reduce((sum, c) => sum + c.monthlyBudgetLimit, 0);
  const totalSpent = expenseCategories.reduce(
    (sum, c) => sum + (spentByCategoryCurrentMonth.get(c.id) ?? 0),
    0
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    const parsedLimit = type === 'EXPENSE' ? Number.parseFloat(limit || '0') : 0;
    if (type === 'EXPENSE' && (!Number.isFinite(parsedLimit) || parsedLimit < 0)) {
      setError('Enter a valid non-negative budget limit.');
      return;
    }
    onSaveCategory({
      name: name.trim(),
      type,
      monthlyBudgetLimit: Number(parsedLimit.toFixed(2)),
      colorHex,
    });
    setName('');
    setLimit('');
    setError('');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditLimit(cat.monthlyBudgetLimit.toString());
  };

  const commitEdit = (cat: Category) => {
    if (!editName.trim()) return;
    const parsedLimit = cat.type === 'EXPENSE' ? Math.max(0, Number.parseFloat(editLimit || '0') || 0) : 0;
    onSaveCategory({
      ...cat,
      name: editName.trim(),
      monthlyBudgetLimit: Number(parsedLimit.toFixed(2)),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories & Monthly Budgets
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Configure spending categories, set monthly caps for {activeMonthKey}, and monitor overspending thresholds.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-neutral-400">
          Total allocated: <strong className="text-slate-900 dark:text-white">{formatCurrency(totalBudgeted)}</strong>
          <span className="mx-2 text-slate-400 dark:text-neutral-600" aria-hidden="true">·</span>
          Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</strong>
        </div>
      </div>

      {/* Add New Category Bar */}
      <form
        onSubmit={handleAdd}
        className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-5"
      >
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Create Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs text-slate-500 dark:text-neutral-400 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Lab Materials"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-neutral-400 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-neutral-400 mb-1">
              Monthly Limit ($)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              disabled={type === 'INCOME'}
              value={type === 'INCOME' ? '' : limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder={type === 'INCOME' ? 'N/A' : '250'}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-neutral-400 mb-1">
              Chart Color
            </label>
            <div className="flex items-center gap-1.5 py-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColorHex(swatch)}
                  aria-label={`Select color ${swatch}`}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    colorHex === swatch ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-black scale-110' : ''
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 dark:text-white mt-2">{error}</p>}
      </form>

      {/* Expense Budgets Grid */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Expense Categories & Monthly Caps <span className="font-mono tabular-nums">({expenseCategories.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategories.map((cat) => {
            const spent = spentByCategoryCurrentMonth.get(cat.id) ?? 0;
            const limitVal = cat.monthlyBudgetLimit;
            const ratio = limitVal > 0 ? spent / limitVal : 0;
            const pct = Math.round(ratio * 100);
            const isOver = limitVal > 0 && ratio >= 1;
            const isWarn = limitVal > 0 && ratio >= 0.8 && ratio < 1;
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2.5 py-1 text-sm rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-black text-slate-900 dark:text-white flex-1 min-w-32"
                        />
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-24 px-2.5 py-1 text-sm font-mono tabular-nums rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-black text-slate-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono tabular-nums mt-0.5">
                          {formatCurrency(spent)} spent of {limitVal > 0 ? formatCurrency(limitVal) : 'No limit'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => commitEdit(cat)}
                          aria-label="Save category edit"
                          className="p-1.5 rounded-md text-emerald-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-neutral-900"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          aria-label="Cancel category edit"
                          className="p-1.5 rounded-md text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          aria-label={`Edit ${cat.name}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          aria-label={`Delete ${cat.name}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-neutral-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {limitVal > 0 && (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? 'bg-red-600 dark:bg-rose-500'
                            : isWarn
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : 'bg-teal-600 dark:bg-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={
                          isOver
                            ? 'font-semibold text-red-700 dark:text-white'
                            : isWarn
                              ? 'font-medium text-amber-700 dark:text-neutral-200'
                              : 'text-slate-600 dark:text-neutral-400'
                        }
                      >
                        {isOver
                          ? <>Over budget by <span className="font-mono tabular-nums">{formatCurrency(spent - limitVal)}</span></>
                          : isWarn
                            ? <>Approaching limit (<span className="font-mono tabular-nums">{formatCurrency(limitVal - spent)}</span> left)</>
                            : <><span className="font-mono tabular-nums">{formatCurrency(limitVal - spent)}</span> remaining</>}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-neutral-400">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Income Categories List */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Income Categories <span className="font-mono tabular-nums">({incomeCategories.length})</span>
        </h2>
        <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800">
          {incomeCategories.map((cat) => (
            <div key={cat.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: cat.colorHex }} />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{cat.name}</span>
                <span className="text-xs text-slate-400 dark:text-neutral-600" aria-hidden="true">·</span>
                <span className="text-xs text-slate-500 dark:text-neutral-400">Income Source</span>
              </div>
              <button
                type="button"
                onClick={() => onDeleteCategory(cat.id)}
                aria-label={`Delete ${cat.name}`}
                className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-neutral-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
