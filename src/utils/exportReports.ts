import { Category, FinancialSummary, Transaction } from '../types/finance';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return /[",\n]/.test(safe) ? `"${safe}"` : safe;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  summary: FinancialSummary
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount (USD)', 'Method / Source', 'Notes'];
  const rows = transactions.map((tx) => [
    escapeCsvCell(tx.id),
    escapeCsvCell(tx.date),
    escapeCsvCell(tx.type),
    escapeCsvCell(tx.title),
    escapeCsvCell(categoryMap.get(tx.categoryId) ?? 'Uncategorized'),
    tx.type === 'EXPENSE' ? `-${tx.amount.toFixed(2)}` : tx.amount.toFixed(2),
    escapeCsvCell(tx.paymentMethodOrSource),
    escapeCsvCell(tx.notes),
  ]);

  const footer = [
    '',
    `Summary Total Income,${summary.totalIncome.toFixed(2)}`,
    `Summary Total Expense,${summary.totalExpense.toFixed(2)}`,
    `Summary Net Balance,${summary.netBalance.toFixed(2)}`,
    `Savings Rate (%),${summary.savingsRatePercent.toFixed(1)}%`,
  ];

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), ...footer].join('\n');
  triggerFileDownload(csvContent, `smart-expense-report-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSummaryToText(
  transactions: Transaction[],
  categories: Category[],
  summary: FinancialSummary
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const lines: string[] = [
    '============================================================',
    '           SMART EXPENSE & BUDGET TRACKER REPORT            ',
    '============================================================',
    `Generated On : ${new Date().toLocaleString()}`,
    `Record Count : ${transactions.length} transactions`,
    '------------------------------------------------------------',
    `Total Income : ${formatCurrency(summary.totalIncome)}`,
    `Total Expense: ${formatCurrency(summary.totalExpense)}`,
    `Net Balance  : ${formatCurrency(summary.netBalance)}`,
    `Savings Rate : ${summary.savingsRatePercent.toFixed(1)}%`,
    '============================================================',
    '',
    'TRANSACTION LEDGER:',
    '------------------------------------------------------------',
  ];

  for (const tx of transactions) {
    const sign = tx.type === 'EXPENSE' ? '-' : '+';
    const cat = categoryMap.get(tx.categoryId) ?? 'Uncategorized';
    lines.push(
      `${tx.date} | ${tx.type.padEnd(7)} | ${cat.padEnd(20)} | ${(sign + formatCurrency(tx.amount)).padStart(11)} | ${tx.title}`
    );
  }

  lines.push('============================================================');
  triggerFileDownload(
    lines.join('\n'),
    `smart-expense-summary-${new Date().toISOString().slice(0, 10)}.txt`,
    'text/plain;charset=utf-8;'
  );
}

function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
