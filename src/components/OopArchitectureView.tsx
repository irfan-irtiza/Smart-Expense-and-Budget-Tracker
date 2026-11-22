import React from 'react';
import { ArrowDown, ArrowUpRight, Layers } from 'lucide-react';

interface OopArchitectureViewProps {
  onInspectFile: (path: string) => void;
}

const DESIGN_PATTERNS = [
  {
    pattern: 'Sealed Hierarchy & Polymorphism',
    files: [
      'src/main/java/com/smartexpense/model/Transaction.java',
      'src/main/java/com/smartexpense/model/Expense.java',
      'src/main/java/com/smartexpense/model/Income.java',
    ],
    explanation:
      'Transaction is a JDK 25 sealed abstract class permitting only Expense and Income. Each subclass overrides signedAmount() and getDetailLabel(), enabling exhaustive switch pattern matching with zero unsafe casts.',
  },
  {
    pattern: 'Repository & Dependency Inversion',
    files: [
      'src/main/java/com/smartexpense/repository/Repository.java',
      'src/main/java/com/smartexpense/repository/JsonStorageRepository.java',
    ],
    explanation:
      'FinanceService receives its storage repository via constructor injection rather than instantiating file I/O internally. Custom Gson adapters preserve Expense/Income polymorphism and perform atomic file moves.',
  },
  {
    pattern: 'Observer Pattern (Live Budget Alerts)',
    files: [
      'src/main/java/com/smartexpense/service/BudgetAlertObserver.java',
      'src/main/java/com/smartexpense/ui/MainController.java',
    ],
    explanation:
      'Whenever an expense is added, edited, or logged from a recurring bill, FinanceService recomputes monthly category limits and notifies registered BudgetAlertObserver listeners so the dashboard alerts update immediately.',
  },
  {
    pattern: 'Strategy Pattern (Sorting & Report Export)',
    files: [
      'src/main/java/com/smartexpense/service/TransactionSortStrategy.java',
      'src/main/java/com/smartexpense/service/ReportExporter.java',
      'src/main/java/com/smartexpense/service/CsvReportExporter.java',
      'src/main/java/com/smartexpense/service/TextReportExporter.java',
    ],
    explanation:
      'Sorting comparators and file exporters (CSV vs. plain-text summary) are encapsulated behind interchangeable Strategy abstractions, keeping the UI open for extension (e.g., adding PDF export) without modifying controller code.',
  },
  {
    pattern: 'Immutable Records & Specification Filter',
    files: [
      'src/main/java/com/smartexpense/model/FinancialSummary.java',
      'src/main/java/com/smartexpense/model/BudgetAlert.java',
      'src/main/java/com/smartexpense/service/TransactionFilterCriteria.java',
    ],
    explanation:
      'JDK 25 record types model immutable value objects (FinancialSummary, BudgetAlert, TransactionFilterCriteria) with zero boilerplate and guaranteed thread-safe data transfer between layers.',
  },
];

const FEATURE_TRACEABILITY = [
  { feature: 'Manage Expenses & Income Sources (CRUD)', classRef: 'Transaction.java / TransactionsPane.java', path: 'src/main/java/com/smartexpense/ui/TransactionsPane.java' },
  { feature: 'Manage Categories & Monthly Budget Caps', classRef: 'Category.java / BudgetsPane.java', path: 'src/main/java/com/smartexpense/ui/BudgetsPane.java' },
  { feature: 'Overspending & Threshold Alerts', classRef: 'BudgetAlertObserver.java / FinanceService.java', path: 'src/main/java/com/smartexpense/service/FinanceService.java' },
  { feature: 'Real-Time Balance & Net Savings Summary', classRef: 'FinancialSummary.java / DashboardPane.java', path: 'src/main/java/com/smartexpense/ui/DashboardPane.java' },
  { feature: 'Interactive Pie Chart & Monthly Bar Chart', classRef: 'DashboardPane.java (JavaFX PieChart & BarChart)', path: 'src/main/java/com/smartexpense/ui/DashboardPane.java' },
  { feature: 'Search, Filter & Sort Transactions', classRef: 'TransactionFilterCriteria.java / TransactionSortStrategy.java', path: 'src/main/java/com/smartexpense/service/TransactionFilterCriteria.java' },
  { feature: 'Recurring Bills & Subscription Reminders', classRef: 'RecurringBill.java / BillsAndGoalsPane.java', path: 'src/main/java/com/smartexpense/model/RecurringBill.java' },
  { feature: 'Savings Goal Tracker & Progress', classRef: 'SavingsGoal.java / BillsAndGoalsPane.java', path: 'src/main/java/com/smartexpense/model/SavingsGoal.java' },
  { feature: 'Export Financial Reports (CSV & TXT)', classRef: 'CsvReportExporter.java / TextReportExporter.java', path: 'src/main/java/com/smartexpense/service/CsvReportExporter.java' },
  { feature: 'Automatic Persistent Data Storage', classRef: 'JsonStorageRepository.java', path: 'src/main/java/com/smartexpense/repository/JsonStorageRepository.java' },
  { feature: 'Dark / Light Theme Toggle', classRef: 'ThemeManager.java / dark-theme.css / light-theme.css', path: 'src/main/java/com/smartexpense/ui/ThemeManager.java' },
];

export const OopArchitectureView: React.FC<OopArchitectureViewProps> = ({ onInspectFile }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Clean OOP Architecture Blueprint
        </h1>
        <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
          Layered dependency flow, sealed class hierarchy, SOLID design patterns, and proposal traceability for OOP Lab evaluation.
        </p>
      </div>

      {/* 4-Layer Clean Architecture Flow */}
      <section className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700 dark:text-white" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Layered Package Architecture (Unidirectional Dependencies)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {[
            {
              step: '01. Presentation & MVC',
              pkg: 'com.smartexpense.ui',
              classes: 'SmartExpenseApp · MainController · DashboardPane · TransactionsPane · BudgetsPane · BillsAndGoalsPane · ThemeManager',
              rule: 'Renders JavaFX nodes and delegates every mutation to FinanceService. Contains zero persistence logic.',
            },
            {
              step: '02. Application Services',
              pkg: 'com.smartexpense.service',
              classes: 'FinanceService · BudgetAlertObserver · TransactionSortStrategy · TransactionFilterCriteria · ReportExporter',
              rule: 'Enforces business rules, evaluates monthly budget alerts, executes strategies, and coordinates atomic saves.',
            },
            {
              step: '03. Domain Model',
              pkg: 'com.smartexpense.model',
              classes: 'sealed Transaction -> Expense, Income · Category · RecurringBill · SavingsGoal · FinancialSummary · BudgetAlert',
              rule: 'Pure Java domain objects using BigDecimal currency math and JDK 25 records. Zero JavaFX or I/O imports.',
            },
            {
              step: '04. Persistence Layer',
              pkg: 'com.smartexpense.repository',
              classes: 'Repository<T, ID> · JsonStorageRepository · AppDataSnapshot',
              rule: 'Serializes polymorphic models to ~/.smart-expense-tracker/ledger-data.json via atomic temp-file replacement.',
            },
          ].map((layer) => (
            <div
              key={layer.pkg}
              className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-black p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{layer.step}</p>
                <p className="text-xs font-mono text-teal-700 dark:text-neutral-300 mt-0.5">{layer.pkg}</p>
                <p className="text-xs text-slate-600 dark:text-neutral-400 mt-2.5 leading-relaxed">
                  {layer.rule}
                </p>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-neutral-500 pt-2 border-t border-slate-200 dark:border-neutral-800">
                {layer.classes}
              </p>
            </div>
          ))}
        </div>

        {/* Sealed Class Inheritance Diagram */}
        <div className="pt-4 border-t border-slate-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Polymorphic Domain Hierarchy (JDK 25 Sealed Classes)
          </h3>

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onInspectFile('src/main/java/com/smartexpense/model/Transaction.java')}
              className="w-full max-w-md text-left rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-black p-4 hover:border-teal-600 dark:hover:border-white transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-teal-700 dark:text-white">
                  sealed abstract class Transaction
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
              </div>
              <p className="font-mono text-xs text-slate-600 dark:text-neutral-400 mt-2">
                - id, title, amount (BigDecimal), categoryId, date, notes
              </p>
              <p className="font-mono text-xs text-slate-800 dark:text-neutral-200 mt-1">
                + abstract signedAmount() · + abstract getType() · + abstract getDetailLabel()
              </p>
            </button>

            <div className="my-2 flex items-center gap-24 text-slate-400 dark:text-neutral-500">
              <ArrowDown className="w-4 h-4" />
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <button
                type="button"
                onClick={() => onInspectFile('src/main/java/com/smartexpense/model/Expense.java')}
                className="text-left rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black p-4 hover:border-teal-600 dark:hover:border-white transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    final class Expense extends Transaction
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-neutral-400 mt-1.5">
                  - paymentMethod: String · - recurring: boolean
                </p>
                <p className="font-mono text-xs text-red-700 dark:text-neutral-300 mt-1">
                  signedAmount() =&gt; amount.negate()
                </p>
              </button>

              <button
                type="button"
                onClick={() => onInspectFile('src/main/java/com/smartexpense/model/Income.java')}
                className="text-left rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black p-4 hover:border-teal-600 dark:hover:border-white transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    final class Income extends Transaction
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-neutral-400 mt-1.5">
                  - source: String
                </p>
                <p className="font-mono text-xs text-emerald-700 dark:text-white mt-1">
                  signedAmount() =&gt; +amount
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* OOP Pillars & Design Patterns Breakdown */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Design Patterns Implemented in JDK 25
        </h2>

        <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 divide-y divide-slate-200 dark:divide-neutral-800">
          {DESIGN_PATTERNS.map((item) => (
            <div key={item.pattern} className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.pattern}
                </h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                {item.files.map((path) => {
                  const fileName = path.split('/').pop() ?? path;
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => onInspectFile(path)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:border-teal-600 dark:hover:border-white hover:text-teal-700 dark:hover:text-white transition-colors whitespace-nowrap"
                    >
                      {fileName}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proposal Traceability Matrix */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Project Proposal Requirement Traceability
        </h2>
        <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-black text-xs text-slate-500 dark:text-neutral-400">
                  <th className="py-3 px-4 font-medium">Proposal Feature</th>
                  <th className="py-3 px-4 font-medium">JDK 25 / JavaFX Implementation</th>
                  <th className="py-3 px-4 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-sm">
                {FEATURE_TRACEABILITY.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50 dark:hover:bg-neutral-900/70">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-neutral-400">
                      {row.classRef}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectFile(row.path)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-white hover:underline whitespace-nowrap"
                      >
                        Open source
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
