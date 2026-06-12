import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expensesAPI, questsAPI, recurringAPI } from "../api";
import { ExpenseItem } from "../components/ExpenseItem";
import { QuestCard } from "../components/QuestCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import BudgetSetupModal from "../components/BudgetSetupModal";
import BudgetHistoryModal from "../components/BudgetHistoryModal";
import EditExpenseModal from "../components/EditExpenseModal";
import RecurringExpensesModal from "../components/RecurringExpensesModal";
import CategoryBudgetsModal from "../components/CategoryBudgetsModal";
import SpendingAlert from "../components/SpendingAlert";
import type { Expense, QuestData } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { getMonthlySpend, getMonthlyRemaining, getDerivedDailyAllowance, getBudgetPercentUsed } from "../utils/budget";
import { formatCurrency } from "../utils/format";
import { MONTH_NAMES } from "../utils/constants";
import { exportExpensesToCSV } from "../utils/csvExport";

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [quests, setQuests]       = useState<QuestData[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Modals
  const [budgetModalOpen,   setBudgetModalOpen]   = useState(false);
  const [historyModalOpen,  setHistoryModalOpen]  = useState(false);
  const [recurringModalOpen,setRecurringModalOpen]= useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExpense,    setEditingExpense]     = useState<Expense | null>(null);

  const monthlyBudget      = user?.monthlyBudget ?? 10000;
  const now                = new Date();
  const currentMonthName   = MONTH_NAMES[now.getMonth()];

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [expRes, questRes] = await Promise.all([expensesAPI.getExpenses(), questsAPI.getQuests()]);
      setExpenses(expRes.data);
      setQuests(questRes.data.filter((q: QuestData) => !q.completed).slice(0, 2));
    } catch { setError("Could not load dashboard data. Is the server running?"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { recurringAPI.processRecurring().catch(() => {}); }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, [loadData]);

  const handleDelete = async (id: string) => {
    try { await expensesAPI.deleteExpense(id); await refreshProfile(); await loadData(); }
    catch { setError("Failed to delete expense."); }
  };

  const handleEditSaved = async () => { await refreshProfile(); await loadData(); };

  const handleExportCSV = () => {
    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    exportExpensesToCSV(
      currentMonthExpenses,
      `fingame-${currentMonthName.toLowerCase()}-${now.getFullYear()}.csv`
    );
  };

  // Budget computations
  const monthlySpent     = getMonthlySpend(expenses, now);
  const monthlyRemaining = getMonthlyRemaining(expenses, monthlyBudget, now);
  const budgetPct        = getBudgetPercentUsed(expenses, monthlyBudget, now);
  const isOverBudget     = monthlyRemaining < 0;
  const dailyAllowance   = getDerivedDailyAllowance(expenses, monthlyBudget, now);
  const daysInMonth      = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft         = daysInMonth - now.getDate() + 1;

  const mascotMessages = isOverBudget
    ? [`Boss fight! You're ${formatCurrency(-monthlyRemaining)} over budget! ⚔️`, `Monthly energy depleted — watch your spending!`]
    : [
        `${formatCurrency(dailyAllowance)}/day to stay on track for the rest of ${currentMonthName}!`,
        `Your streak is ${user?.streak ?? 0} days strong — don't break the chain! 🔥`,
        `${daysLeft} days left this month — ${formatCurrency(monthlyRemaining)} remaining.`,
        `Level ${user?.level ?? 1} adventurer — every deed logged earns XP!`,
      ];
  const mascotMsg = mascotMessages[(user?.level ?? 1) % mascotMessages.length];

  if (loading) return <LoadingSpinner />;
  if (error && expenses.length === 0 && quests.length === 0) {
    return (
      <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto lg:max-w-5xl">
        <ApiErrorState message={error} onRetry={() => { setLoading(true); loadData(); }} />
      </main>
    );
  }

  return (
    <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto lg:max-w-5xl">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="text-xs underline shrink-0">Retry</button>
        </div>
      )}

      {/* Spending Alert */}
      <SpendingAlert percentUsed={budgetPct} monthlyBudget={monthlyBudget} spent={monthlySpent} />

      {/* Monthly Budget Card */}
      <section id="tour-daily-energy" className={`glass-card p-card-padding rounded-2xl mb-6 relative overflow-hidden ${isOverBudget ? "border border-error/40" : "glow-teal"}`}>
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${isOverBudget ? "bg-error/15" : "bg-secondary/10"}`} />

        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{currentMonthName} Budget</p>
            <p className={`font-display-lg text-4xl md:text-5xl mt-1 ${isOverBudget ? "text-error" : "text-secondary"}`}>
              {formatCurrency(monthlyRemaining)}
              <span className="text-lg text-on-surface-variant ml-2 font-body-lg">{isOverBudget ? "OVER BUDGET" : "REMAINING"}</span>
            </p>
          </div>
          <button type="button" onClick={() => setBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 text-xs font-label-caps transition-all active:scale-95 shrink-0 cursor-pointer select-none z-10 relative">
            <span className="material-symbols-outlined text-sm pointer-events-none">edit</span>
            <span className="pointer-events-none">Edit Budget</span>
          </button>
        </div>

        <div className="my-4">
          <ProgressBar value={Math.min(budgetPct, 100)} max={100} />
          <div className="flex justify-between text-xs text-on-surface-variant mt-1.5">
            <span>{formatCurrency(monthlySpent)} spent</span>
            <span>{Math.round(budgetPct)}% used</span>
            <span>of {formatCurrency(monthlyBudget)}</span>
          </div>
        </div>

        <p className="text-on-surface-variant text-sm mb-5 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">smart_toy</span>
          <span><strong className="text-primary">Fin says:</strong> &ldquo;{mascotMsg}&rdquo;</span>
        </p>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.dispatchEvent(new CustomEvent("open-add-expense"))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-label-caps text-label-caps hover:border-primary/50 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-secondary">add</span>ADD EXPENSE
          </button>
          <button onClick={() => setRecurringModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-label-caps text-label-caps hover:border-secondary/50 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-secondary">repeat</span>RECURRING
          </button>
          <button onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-label-caps text-label-caps hover:border-primary/50 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">category</span>CAT BUDGETS
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-label-caps text-label-caps hover:border-tertiary/50 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-tertiary">download</span>EXPORT CSV
          </button>
        </div>
      </section>

      {/* Quest Log */}
      <section id="tour-quest-log" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Quest Log</h2>
          <Link to="/quests" className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed-dim transition-colors">VIEW ALL</Link>
        </div>
        <div className="grid gap-3">
          {quests.length > 0
            ? quests.map((q) => <QuestCard key={q.id} data={q} compact />)
            : <p className="text-on-surface-variant text-sm glass-card p-4 rounded-xl">No active quests — visit Quests to start one!</p>}
        </div>
        {(user?.streak ?? 0) > 0 && (
          <p className="text-center text-tertiary text-xs font-bold mt-4 streak-pulse">🔥 {user?.streak} DAY STREAK – Don't break the chain!</p>
        )}
      </section>

      {/* Recent Deeds */}
      <section>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4">Recent Deeds</h2>
        <div className="glass-card p-4 rounded-xl">
          {expenses.length > 0
            ? expenses.slice(0, 8).map((e) => (
                <ExpenseItem key={e.id} expense={e} onDelete={handleDelete} onEdit={(exp) => setEditingExpense(exp)} />
              ))
            : <p className="text-on-surface-variant text-center py-8 text-sm">No deeds logged yet. Tap + to log your first expense!</p>}
        </div>
      </section>

      {/* Modals */}
      <BudgetSetupModal isOpen={budgetModalOpen} onClose={() => setBudgetModalOpen(false)} onViewHistory={() => setHistoryModalOpen(true)} />
      <BudgetHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} currentBudget={monthlyBudget} />
      <RecurringExpensesModal isOpen={recurringModalOpen} onClose={() => { setRecurringModalOpen(false); loadData(); }} />
      <CategoryBudgetsModal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
      <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={handleEditSaved} />
    </main>
  );
};

export default Dashboard;
