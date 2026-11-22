import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  categories,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethodOrSource, setPaymentMethodOrSource] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const availableCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethodOrSource(editingTransaction.paymentMethodOrSource);
      setNotes(editingTransaction.notes);
    } else {
      setType('EXPENSE');
      setTitle('');
      setAmount('');
      const firstExp = categories.find((c) => c.type === 'EXPENSE');
      setCategoryId(firstExp?.id ?? '');
      setDate('2026-11-21');
      setPaymentMethodOrSource('Debit Card');
      setNotes('');
    }
    setError('');
  }, [isOpen, editingTransaction, categories]);

  useEffect(() => {
    if (!isOpen) return;
    const valid = availableCategories.some((c) => c.id === categoryId);
    if (!valid && availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number.parseFloat(amount);
    if (!title.trim()) {
      setError('Enter a clear description for this transaction.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (!categoryId) {
      setError('Select a category.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      type,
      title: title.trim(),
      amount: Number(numericAmount.toFixed(2)),
      categoryId,
      date,
      paymentMethodOrSource:
        paymentMethodOrSource.trim() || (type === 'EXPENSE' ? 'Debit Card' : 'Direct Transfer'),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800">
          <h2 id="transaction-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Switch */}
          <div>
            <span className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
              Transaction Type
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-neutral-900">
              {(['EXPENSE', 'INCOME'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (!editingTransaction) {
                      setPaymentMethodOrSource(t === 'EXPENSE' ? 'Debit Card' : 'Direct Transfer');
                    }
                  }}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    type === t
                      ? 'bg-white dark:bg-white text-slate-900 dark:text-black shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'EXPENSE' ? 'Expense' : 'Income Source'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                Title / Description
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'EXPENSE' ? 'e.g. Weekly Groceries' : 'e.g. Freelance Milestone'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                {type === 'EXPENSE' ? 'Payment Method' : 'Income Source'}
              </label>
              <input
                type="text"
                value={paymentMethodOrSource}
                onChange={(e) => setPaymentMethodOrSource(e.target.value)}
                placeholder={type === 'EXPENSE' ? 'Credit Card, Cash...' : 'Client, Payroll...'}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details or receipt reference"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-neutral-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-white font-medium">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap"
            >
              {editingTransaction ? 'Save Changes' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
