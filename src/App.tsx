import { useState } from 'react';
import {
  ArrowLeftRight,
  CalendarClock,
  Download,
  Layers,
  LayoutDashboard,
  Menu,
  Moon,
  PieChart,
  Plus,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Transaction, WorkspaceSection } from './types/finance';
import { OverviewView } from './components/OverviewView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { BillsGoalsView } from './components/BillsGoalsView';
import { JavaFxCodeExplorerView } from './components/JavaFxCodeExplorerView';
import { OopArchitectureView } from './components/OopArchitectureView';
import { TransactionModal } from './components/TransactionModal';
import { downloadJavaFxProjectZip } from './data/javafxProjectFiles';

const SECTION_LABELS: Record<WorkspaceSection, string> = {
  overview: 'Overview',
  transactions: 'Transactions',
  budgets: 'Budgets & Categories',
  'bills-goals': 'Bills & Goals',
  'javafx-code': 'JavaFX JDK 25 Source',
  'oop-architecture': 'OOP Architecture',
};

export default function App() {
  const store = useFinanceStore();
  const [section, setSection] = useState<WorkspaceSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedJavaFile, setSelectedJavaFile] = useState<string>(
    'src/main/java/com/smartexpense/model/Transaction.java'
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const openAddModal = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleInspectJavaFile = (filePath: string) => {
    setSelectedJavaFile(filePath);
    setSection('javafx-code');
  };

  const handleNavClick = (target: WorkspaceSection) => {
    setSection(target);
    setMobileMenuOpen(false);
  };

  const isJavaFxView = section === 'javafx-code' || section === 'oop-architecture';

  const financeNavItems: { id: WorkspaceSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets & Categories', icon: PieChart },
    { id: 'bills-goals', label: 'Bills & Goals', icon: CalendarClock },
  ];

  const javafxNavItems: { id: WorkspaceSection; label: string; icon: typeof Layers }[] = [
    { id: 'oop-architecture', label: 'OOP Architecture', icon: Layers },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Smart Expense
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Primary Workspace Navigation" className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 pb-2 text-xs font-medium text-slate-500 dark:text-neutral-500">
            Desktop Tracker
          </p>
          <div className="space-y-1">
            {financeNavItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-teal-50 dark:bg-white text-teal-800 dark:text-black'
                      : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 pb-2 text-xs font-medium text-slate-500 dark:text-neutral-500">
            OOP Lab Deliverable
          </p>
          <div className="space-y-1">
            {javafxNavItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-teal-50 dark:bg-white text-teal-800 dark:text-black'
                      : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-neutral-800 space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={store.toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
        >
          <span className="flex items-center gap-2">
            {store.darkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {store.darkTheme ? 'Light Mode' : 'Dark Mode'}
          </span>
          <span className="text-slate-400 dark:text-neutral-500">{store.darkTheme ? 'On' : 'Off'}</span>
        </button>

        {confirmReset ? (
          <div className="flex items-center gap-1.5 px-2 py-1">
            <button
              type="button"
              onClick={() => {
                store.resetToSampleData();
                setConfirmReset(false);
              }}
              className="flex-1 py-1.5 px-2 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black whitespace-nowrap"
            >
              Confirm Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sample Data
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-800 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-64 max-w-[80vw] bg-white dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-800 h-full">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Top Bar */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4 bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                {isJavaFxView ? 'JDK 25 JavaFX Project' : 'Workspace'}
              </span>
              <span className="text-slate-400 dark:text-neutral-600" aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {SECTION_LABELS[section]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isJavaFxView ? (
              <button
                type="button"
                onClick={() => void downloadJavaFxProjectZip()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                Download JavaFX ZIP
              </button>
            ) : (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            )}
          </div>
        </header>

        {/* Active View Canvas */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {section === 'overview' && (
            <OverviewView
              transactions={store.transactions}
              categories={store.categories}
              bills={store.bills}
              goals={store.goals}
              overallSummary={store.overallSummary}
              activeMonthSummary={store.activeMonthSummary}
              activeMonthKey={store.activeMonthKey}
              budgetAlerts={store.budgetAlerts}
              darkTheme={store.darkTheme}
              onNavigate={setSection}
              onPayBill={store.payBillAndLogExpense}
            />
          )}

          {section === 'transactions' && (
            <TransactionsView
              categories={store.categories}
              queryTransactions={store.queryTransactions}
              onAddTransaction={openAddModal}
              onEditTransaction={openEditModal}
              onDeleteTransaction={store.deleteTransaction}
            />
          )}

          {section === 'budgets' && (
            <BudgetsView
              categories={store.categories}
              spentByCategoryCurrentMonth={store.spentByCategoryCurrentMonth}
              activeMonthKey={store.activeMonthKey}
              onSaveCategory={store.saveCategory}
              onDeleteCategory={store.deleteCategory}
            />
          )}

          {section === 'bills-goals' && (
            <BillsGoalsView
              bills={store.bills}
              goals={store.goals}
              categories={store.categories}
              onSaveBill={store.saveBill}
              onDeleteBill={store.deleteBill}
              onPayBill={store.payBillAndLogExpense}
              onSaveGoal={store.saveGoal}
              onContributeGoal={store.contributeToGoal}
              onDeleteGoal={store.deleteGoal}
            />
          )}

          {section === 'javafx-code' && (
            <JavaFxCodeExplorerView
              selectedFilePath={selectedJavaFile}
              onSelectFilePath={setSelectedJavaFile}
            />
          )}

          {section === 'oop-architecture' && (
            <OopArchitectureView onInspectFile={handleInspectJavaFile} />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        editingTransaction={editingTx}
        categories={store.categories}
        onClose={() => setModalOpen(false)}
        onSave={store.saveTransaction}
      />
    </div>
  );
}
