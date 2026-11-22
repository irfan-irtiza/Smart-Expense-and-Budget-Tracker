import React, { useMemo, useState } from 'react';
import { Download, FileText, Pencil, Search, Trash2, RotateCcw } from 'lucide-react';
import {
  Category,
  SortStrategy,
  Transaction,
  TransactionFilter,
  TransactionType,
} from '../types/finance';
import { calculateSummary } from '../hooks/useFinanceStore';
import {
  exportSummaryToText,
  exportTransactionsToCsv,
  formatCurrency,
} from '../utils/exportReports';

interface TransactionsViewProps {
  categories: Category[];
  queryTransactions: (filter: TransactionFilter) => Transaction[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const DEFAULT_FILTER: TransactionFilter = {
  keyword: '',
  type: 'ALL',
  categoryId: 'ALL',
  startDate: '',
  endDate: '',
  sortBy: 'DATE_DESC',
};

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  categories,
  queryTransactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filter, setFilter] = useState<TransactionFilter>(DEFAULT_FILTER);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const results = useMemo(() => queryTransactions(filter), [queryTransactions, filter]);
  const filteredSummary = useMemo(() => calculateSummary(results), [results]);

  const hasActiveFilter =
    filter.keyword !== '' ||
    filter.type !== 'ALL' ||
    filter.categoryId !== 'ALL' ||
    filter.startDate !== '' ||
    filter.endDate !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions Ledger
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Search, filter, sort, manage expenses and income sources, and export formatted reports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportTransactionsToCsv(results, categories, filteredSummary)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportSummaryToText(results, categories, filteredSummary)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            Export TXT
          </button>
        </div>
      </div>

      {/* Filter & Sort Toolbar */}
      <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filter.keyword}
              onChange={(e) => setFilter((f) => ({ ...f, keyword: e.target.value }))}
              placeholder="Search by title, notes, category, or payment source..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-neutral-900 shrink-0">
            {(['ALL', 'EXPENSE', 'INCOME'] as ('ALL' | TransactionType)[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter((f) => ({ ...f, type: t }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filter.type === t
                    ? 'bg-white dark:bg-white text-slate-900 dark:text-black shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            aria-label="Filter by category"
            value={filter.categoryId}
            onChange={(e) => setFilter((f) => ({ ...f, categoryId: e.target.value }))}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === 'EXPENSE' ? 'Expense' : 'Income'})
              </option>
            ))}
          </select>

          <select
            aria-label="Sort transactions"
            value={filter.sortBy}
            onChange={(e) => setFilter((f) => ({ ...f, sortBy: e.target.value as SortStrategy }))}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
          >
            <option value="DATE_DESC">Sort: Date (Newest First)</option>
            <option value="DATE_ASC">Sort: Date (Oldest First)</option>
            <option value="AMOUNT_DESC">Sort: Amount (High to Low)</option>
            <option value="AMOUNT_ASC">Sort: Amount (Low to High)</option>
            <option value="CATEGORY_ASC">Sort: Category (A to Z)</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-neutral-400 shrink-0">From</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-neutral-400 shrink-0">To</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Filtered Totals Bar */}
        <div className="pt-2.5 border-t border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
            <span>{results.length} matching records</span>
            <span aria-hidden="true">·</span>
            <span>
              Income: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(filteredSummary.totalIncome)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Expenses: <strong className="text-rose-700 dark:text-rose-400">{formatCurrency(filteredSummary.totalExpense)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Net: <strong className="text-slate-900 dark:text-white">{formatCurrency(filteredSummary.netBalance)}</strong>
            </span>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => setFilter(DEFAULT_FILTER)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-white hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 overflow-hidden">
        {results.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              No transactions match your current filter criteria.
            </p>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Clear active filters or record a new expense or income entry.
            </p>
            <button
              type="button"
              onClick={onAddTransaction}
              className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors"
            >
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-black text-xs text-slate-500 dark:text-neutral-400">
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Category & Type</th>
                  <th className="py-3 px-4 font-medium">Method / Source</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-sm">
                {results.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-900/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 dark:text-neutral-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-white">{tx.title}</p>
                        {tx.notes && (
                          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {tx.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-neutral-400 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-neutral-200">
                          {cat?.name ?? 'Uncategorized'}
                        </span>
                        <span className="mx-1.5 text-slate-400 dark:text-neutral-600" aria-hidden="true">·</span>
                        <span
                          className={
                            tx.type === 'INCOME'
                              ? 'font-medium text-emerald-700 dark:text-emerald-400'
                              : 'font-medium text-rose-700 dark:text-rose-400'
                          }
                        >
                          {tx.type === 'INCOME' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-neutral-400 whitespace-nowrap">
                        {tx.paymentMethodOrSource}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono tabular-nums font-medium whitespace-nowrap ${
                          tx.type === 'INCOME'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`Edit ${tx.title}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            aria-label={`Delete ${tx.title}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
