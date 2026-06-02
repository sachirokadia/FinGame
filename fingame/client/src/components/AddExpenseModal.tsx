import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { expensesAPI } from "../api";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { getDailyRemaining } from "../utils/budget";
import { formatCurrency } from "../utils/format";
import type { Expense } from "../types";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { showXPToast, refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    expensesAPI
      .getExpenses()
      .then((res) => setExpenses(res.data))
      .catch(() => setExpenses([]));
  }, [isOpen, date]);

  if (!isOpen) return null;

  const remaining = getDailyRemaining(expenses, date);
  const parsed = parseFloat(amount);
  const hasValidAmount = amount && !Number.isNaN(parsed) && parsed > 0;
  const projectedRemaining = hasValidAmount ? remaining - parsed : remaining;
  const wouldExceedBudget = hasValidAmount && projectedRemaining < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidAmount) {
      setError("Enter a valid amount greater than ₹0.00");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await expensesAPI.addExpense({
        amount: parsed,
        category,
        note: note || undefined,
        date,
      });
      const { xpAwarded, leveledUp } = res.data;
      showXPToast(xpAwarded, leveledUp ? `+${xpAwarded} XP — LEVEL UP! ⚡` : `+${xpAwarded} XP ⚡`);
      await refreshProfile();
      window.dispatchEvent(new CustomEvent("expense-added"));
      setAmount("");
      setNote("");
      setCategory(EXPENSE_CATEGORIES[0].value);
      onClose();
    } catch {
      setError("Failed to log expense. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-md rounded-2xl p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-title-md text-title-md text-primary">Log a Deed</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div
          className={`mb-5 px-4 py-3 rounded-xl border text-sm ${
            remaining < 0
              ? "bg-error-container/20 border-error/30 text-error"
              : "bg-surface-container-high border-white/10 text-on-surface-variant"
          }`}
        >
          <span className="font-label-caps text-label-caps block text-xs mb-1">Daily energy left</span>
          <span className={`font-semibold ${remaining < 0 ? "text-error" : "text-secondary"}`}>
            {formatCurrency(remaining)}
          </span>
          {hasValidAmount && (
            <span className="block mt-1 text-xs">
              After this deed:{" "}
              <span className={wouldExceedBudget ? "text-error font-semibold" : "text-on-surface"}>
                {formatCurrency(projectedRemaining)}
              </span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-on-surface-variant">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0.00"
                required
                className={`w-full text-center text-4xl font-display-lg py-4 px-10 rounded-xl sunken-surface border text-primary focus:outline-none focus:ring-2 bg-transparent ${
                  wouldExceedBudget
                    ? "border-error/50 focus:ring-error"
                    : "border-outline-variant/50 focus:ring-primary"
                }`}
              />
            </div>
          </div>

          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Category</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                    category === cat.value
                      ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary border-transparent glow-teal"
                      : "bg-surface-container-high text-on-surface border-white/10 hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-sm font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Note (optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Burger Quest..."
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="date" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {wouldExceedBudget && !error && (
            <p className="text-tertiary text-sm bg-tertiary/10 border border-tertiary/30 px-3 py-2 rounded-lg">
              Boss fight! This will put you at {formatCurrency(projectedRemaining)} for the day.
            </p>
          )}

          {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all disabled:opacity-50"
          >
            {loading ? "Logging..." : "Log Deed →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
