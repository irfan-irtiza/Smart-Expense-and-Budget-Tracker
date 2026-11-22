import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SEED_BILLS,
  SEED_CATEGORIES,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from '../data/seedData';
import {
  BudgetAlert,
  Category,
  FinancialSummary,
  RecurringBill,
  SavingsGoal,
  Transaction,
  TransactionFilter,
} from '../types/finance';

const STORAGE_KEY = 'smart_expense_tracker_v1';

interface PersistedState {
  transactions: Transaction[];
  categories: Category[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  darkTheme: boolean;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        return {
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : SEED_TRANSACTIONS,
          categories: parsed.categories,
          bills: Array.isArray(parsed.bills) ? parsed.bills : SEED_BILLS,
          goals: Array.isArray(parsed.goals) ? parsed.goals : SEED_GOALS,
          darkTheme: Boolean(parsed.darkTheme),
        };
      }
    }
  } catch {
    // Fallback to clean seed state if localStorage is unavailable or corrupt
  }

  return {
    transactions: SEED_TRANSACTIONS,
    categories: SEED_CATEGORIES,
    bills: SEED_BILLS,
    goals: SEED_GOALS,
    darkTheme: false,
  };
}

function addFrequencyToDate(dateStr: string, frequency: RecurringBill['frequency']): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (frequency === 'WEEKLY') dt.setUTCDate(dt.getUTCDate() + 7);
  else if (frequency === 'MONTHLY') dt.setUTCMonth(dt.getUTCMonth() + 1);
  else dt.setUTCFullYear(dt.getUTCFullYear() + 1);
  return dt.toISOString().slice(0, 10);
}

export function calculateSummary(scope: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of scope) {
    if (tx.type === 'INCOME') totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }
  const netBalance = totalIncome - totalExpense;
  const savingsRatePercent = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
  return { totalIncome, totalExpense, netBalance, savingsRatePercent };
}

export function useFinanceStore() {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.darkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.darkTheme]);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, darkTheme: !prev.darkTheme }));
  }, []);

  const resetToSampleData = useCallback(() => {
    setState((prev) => ({
      transactions: SEED_TRANSACTIONS,
      categories: SEED_CATEGORIES,
      bills: SEED_BILLS,
      goals: SEED_GOALS,
      darkTheme: prev.darkTheme,
    }));
  }, []);

  const saveTransaction = useCallback((tx: Omit<Transaction, 'id'> & { id?: string }) => {
    const id = tx.id ?? `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: Transaction = { ...tx, id };
    setState((prev) => {
      const exists = prev.transactions.some((item) => item.id === id);
      const next = exists
        ? prev.transactions.map((item) => (item.id === id ? record : item))
        : [record, ...prev.transactions];
      return { ...prev, transactions: next };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  }, []);

  const saveCategory = useCallback((cat: Omit<Category, 'id'> & { id?: string }) => {
    const id = cat.id ?? `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const record: Category = { ...cat, id };
    setState((prev) => {
      const exists = prev.categories.some((c) => c.id === id);
      const next = exists
        ? prev.categories.map((c) => (c.id === id ? record : c))
        : [...prev.categories, record];
      return { ...prev, categories: next };
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  }, []);

  const saveBill = useCallback((bill: Omit<RecurringBill, 'id'> & { id?: string }) => {
    const id = bill.id ?? `bill-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const record: RecurringBill = { ...bill, id };
    setState((prev) => {
      const exists = prev.bills.some((b) => b.id === id);
      const next = exists
        ? prev.bills.map((b) => (b.id === id ? record : b))
        : [record, ...prev.bills];
      return { ...prev, bills: next };
    });
  }, []);

  const deleteBill = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
  }, []);

  const payBillAndLogExpense = useCallback((billId: string) => {
    setState((prev) => {
      const bill = prev.bills.find((b) => b.id === billId);
      if (!bill) return prev;
      const today = new Date().toISOString().slice(0, 10);
      const loggedExpense: Transaction = {
        id: `tx-bill-${Date.now()}`,
        type: 'EXPENSE',
        title: bill.title,
        amount: bill.amount,
        categoryId: bill.categoryId,
        date: today,
        notes: `Logged from recurring ${bill.frequency.toLowerCase()} bill`,
        paymentMethodOrSource: 'Auto-Pay',
      };
      const updatedBills = prev.bills.map((b) =>
        b.id === billId
          ? { ...b, dueDate: addFrequencyToDate(b.dueDate, b.frequency), paidForCycle: true }
          : b
      );
      return {
        ...prev,
        transactions: [loggedExpense, ...prev.transactions],
        bills: updatedBills,
      };
    });
  }, []);

  const saveGoal = useCallback((goal: Omit<SavingsGoal, 'id'> & { id?: string }) => {
    const id = goal.id ?? `goal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const record: SavingsGoal = { ...goal, id };
    setState((prev) => {
      const exists = prev.goals.some((g) => g.id === id);
      const next = exists
        ? prev.goals.map((g) => (g.id === id ? record : g))
        : [record, ...prev.goals];
      return { ...prev, goals: next };
    });
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Number((g.currentAmount + amount).toFixed(2)) } : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, []);

  const activeMonthKey = useMemo(() => {
    // Use latest transaction's month if available, else current month
    if (state.transactions.length === 0) {
      return new Date().toISOString().slice(0, 7);
    }
    const sortedDates = state.transactions.map((t) => t.date).sort();
    return sortedDates[sortedDates.length - 1].slice(0, 7);
  }, [state.transactions]);

  const overallSummary = useMemo(
    () => calculateSummary(state.transactions),
    [state.transactions]
  );

  const activeMonthSummary = useMemo(
    () =>
      calculateSummary(
        state.transactions.filter((t) => t.date.startsWith(activeMonthKey))
      ),
    [state.transactions, activeMonthKey]
  );

  const spentByCategoryCurrentMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of state.transactions) {
      if (tx.type === 'EXPENSE' && tx.date.startsWith(activeMonthKey)) {
        map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }
    return map;
  }, [state.transactions, activeMonthKey]);

  const budgetAlerts = useMemo<BudgetAlert[]>(() => {
    const alerts: BudgetAlert[] = [];
    for (const cat of state.categories) {
      if (cat.type !== 'EXPENSE' || cat.monthlyBudgetLimit <= 0) continue;
      const spent = spentByCategoryCurrentMonth.get(cat.id) ?? 0;
      const ratio = spent / cat.monthlyBudgetLimit;
      if (ratio >= 1) {
        alerts.push({
          categoryId: cat.id,
          categoryName: cat.name,
          spent,
          limit: cat.monthlyBudgetLimit,
          ratio,
          severity: 'EXCEEDED',
        });
      } else if (ratio >= 0.8) {
        alerts.push({
          categoryId: cat.id,
          categoryName: cat.name,
          spent,
          limit: cat.monthlyBudgetLimit,
          ratio,
          severity: 'WARNING',
        });
      }
    }
    return alerts.sort((a, b) => b.ratio - a.ratio);
  }, [state.categories, spentByCategoryCurrentMonth]);

  const queryTransactions = useCallback(
    (filter: TransactionFilter): Transaction[] => {
      const catNames = new Map(state.categories.map((c) => [c.id, c.name]));
      const q = filter.keyword.trim().toLowerCase();

      const filtered = state.transactions.filter((tx) => {
        if (filter.type !== 'ALL' && tx.type !== filter.type) return false;
        if (filter.categoryId !== 'ALL' && tx.categoryId !== filter.categoryId) return false;
        if (filter.startDate && tx.date < filter.startDate) return false;
        if (filter.endDate && tx.date > filter.endDate) return false;
        if (q) {
          const catName = (catNames.get(tx.categoryId) ?? '').toLowerCase();
          return (
            tx.title.toLowerCase().includes(q) ||
            tx.notes.toLowerCase().includes(q) ||
            tx.paymentMethodOrSource.toLowerCase().includes(q) ||
            catName.includes(q)
          );
        }
        return true;
      });

      return [...filtered].sort((a, b) => {
        switch (filter.sortBy) {
          case 'DATE_DESC':
            return b.date.localeCompare(a.date);
          case 'DATE_ASC':
            return a.date.localeCompare(b.date);
          case 'AMOUNT_DESC':
            return b.amount - a.amount;
          case 'AMOUNT_ASC':
            return a.amount - b.amount;
          case 'CATEGORY_ASC':
            return (catNames.get(a.categoryId) ?? '').localeCompare(catNames.get(b.categoryId) ?? '');
        }
      });
    },
    [state.transactions, state.categories]
  );

  return {
    ...state,
    activeMonthKey,
    overallSummary,
    activeMonthSummary,
    spentByCategoryCurrentMonth,
    budgetAlerts,
    toggleTheme,
    resetToSampleData,
    saveTransaction,
    deleteTransaction,
    saveCategory,
    deleteCategory,
    saveBill,
    deleteBill,
    payBillAndLogExpense,
    saveGoal,
    contributeToGoal,
    deleteGoal,
    queryTransactions,
  };
}
