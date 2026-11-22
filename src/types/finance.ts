export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  monthlyBudgetLimit: number; // 0 if income or no cap
  colorHex: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  notes: string;
  paymentMethodOrSource: string; // Payment method for EXPENSE, Source for INCOME
}

export type BillFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  dueDate: string; // YYYY-MM-DD
  frequency: BillFrequency;
  paidForCycle: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export type AlertSeverity = 'WARNING' | 'EXCEEDED';

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number;
  ratio: number;
  severity: AlertSeverity;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRatePercent: number;
}

export type SortStrategy =
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
  | 'CATEGORY_ASC';

export interface TransactionFilter {
  keyword: string;
  type: 'ALL' | TransactionType;
  categoryId: string; // 'ALL' or category id
  startDate: string;
  endDate: string;
  sortBy: SortStrategy;
}

export type WorkspaceSection =
  | 'overview'
  | 'transactions'
  | 'budgets'
  | 'bills-goals'
  | 'javafx-code'
  | 'oop-architecture';
