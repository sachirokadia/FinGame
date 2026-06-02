import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expensesAPI, questsAPI } from "../api";
import { ExpenseItem } from "../components/ExpenseItem";
import { QuestCard } from "../components/QuestCard";
import type { Expense, QuestData } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { DAILY_BUDGET } from "../utils/constants";
import { getDailyRemaining } from "../utils/budget";
import { formatCurrency } from "../utils/format";

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [expRes, questRes] = await Promise.all([expensesAPI.getExpenses(), questsAPI.getQuests()]);
      setExpenses(expRes.data);
      setQuests(questRes.data.filter((q: QuestData) => !q.completed).slice(0, 2));
    } catch {
      setError("Could not load dashboard data. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, [loadData]);

  const handleDelete = async (id: string) => {
    try {
      await expensesAPI.deleteExpense(id);
      await refreshProfile();
      await loadData();
    } catch {
      setError("Failed to delete expense. Please try again.");
    }
  };

  const today = new Date();
  const remaining = getDailyRemaining(expenses, today);
  const isOverBudget = remaining < 0;
  const budgetPct = Math.max(0, Math.round((remaining / DAILY_BUDGET) * 100));
  const mascotMessages = isOverBudget
    ? [
        `Boss fight! You're ${formatCurrency(-remaining)} over today's budget! ⚔️`,
        `Daily energy depleted — tread carefully, adventurer!`,
      ]
    : [
        `You have ${budgetPct}% of your daily energy left — spend wisely!`,
        `Your streak is ${user?.streak ?? 0} days strong — don't break the chain! 🔥`,
        `${remaining > DAILY_BUDGET * 0.5 ? "Plenty of mana left today!" : "Boss fight ahead — spend wisely!"}`,
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

      <section
        id="tour-daily-energy"
        className={`glass-card p-card-padding rounded-2xl mb-6 relative overflow-hidden ${
          isOverBudget ? "border border-error/40 glow-shadow-primary" : "glow-teal"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 ${
            isOverBudget ? "bg-error/15" : "bg-secondary/10"
          }`}
        />
        <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Daily Energy</p>
        <p className={`font-display-lg text-4xl md:text-5xl mb-1 ${isOverBudget ? "text-error" : "text-secondary"}`}>
          {formatCurrency(remaining)}
          <span className="text-lg text-on-surface-variant ml-2 font-body-lg">
            {isOverBudget ? "OVER BUDGET" : "REMAINING"}
          </span>
        </p>
        <p className="text-on-surface-variant text-sm mb-6 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">smart_toy</span>
          <span>
            <strong className="text-primary">Fin says:</strong> &ldquo;{mascotMsg}&rdquo;
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-add-expense"))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-label-caps text-label-caps hover:border-primary/50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-secondary">add</span>
            ADD EXPENSE
          </button>
          <span
            title="Coming soon"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant font-label-caps text-label-caps opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined">document_scanner</span>
            SCAN RECEIPT
            <span className="text-[9px] normal-case font-normal">(soon)</span>
          </span>
        </div>
      </section>

      <section id="tour-quest-log" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Quest Log</h2>
          <Link to="/quests" className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed-dim transition-colors">
            VIEW ALL
          </Link>
        </div>
        <div className="grid gap-3">
          {quests.length > 0 ? (
            quests.map((q) => <QuestCard key={q.id} data={q} compact />)
          ) : (
            <p className="text-on-surface-variant text-sm glass-card p-4 rounded-xl">No active quests — visit Quests to start one!</p>
          )}
        </div>
        {(user?.streak ?? 0) > 0 && (
          <p className="text-center text-tertiary text-xs font-bold mt-4 streak-pulse">
            🔥 {user?.streak} DAY STREAK – Don&apos;t break the chain!
          </p>
        )}
      </section>

      <section>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4">Recent Deeds</h2>
        <div className="glass-card p-4 rounded-xl">
          {expenses.length > 0 ? (
            expenses.slice(0, 8).map((e) => (
              <ExpenseItem key={e.id} expense={e} onDelete={handleDelete} />
            ))
          ) : (
            <p className="text-on-surface-variant text-center py-8 text-sm">
              No deeds logged yet. Tap + to log your first expense!
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
