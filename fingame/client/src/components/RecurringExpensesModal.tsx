import React, { useEffect, useState } from "react";
import { recurringAPI } from "../api";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { formatCurrency, getCategoryEmoji } from "../utils/format";
import type { RecurringExpense } from "../types";

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDINAL = (n: number) => {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({ isOpen, onClose }) => {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Add form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [note, setNote] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recurringAPI.getRecurring();
      setRecurring(res.data);
    } catch {
      setError("Could not load recurring expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) { load(); setAdding(false); setError(""); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { setError("Enter a valid amount"); return; }
    const day = parseInt(dayOfMonth);
    if (isNaN(day) || day < 1 || day > 28) { setError("Day must be between 1 and 28"); return; }
    setSubmitting(true);
    setError("");
    try {
      await recurringAPI.addRecurring({ amount: parsed, category, note: note || undefined, dayOfMonth: day });
      setAmount(""); setNote(""); setDayOfMonth("1"); setCategory(EXPENSE_CATEGORIES[0].value);
      setAdding(false);
      await load();
    } catch {
      setError("Failed to add recurring expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (r: RecurringExpense) => {
    try {
      await recurringAPI.updateRecurring(r.id, { active: !r.active });
      await load();
    } catch {
      setError("Failed to update.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await recurringAPI.deleteRecurring(id);
      await load();
    } catch {
      setError("Failed to delete.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-in max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="font-title-md text-title-md text-primary">Recurring Expenses</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Auto-logged on the set day each month</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg mb-3 shrink-0">{error}</p>}

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {loading && <p className="text-on-surface-variant text-sm text-center py-4">Loading...</p>}
          {!loading && recurring.length === 0 && (
            <p className="text-on-surface-variant text-sm text-center py-8">No recurring expenses yet.</p>
          )}
          {recurring.map((r) => (
            <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${r.active ? "bg-surface-container-high border-white/10" : "bg-surface-container-lowest border-white/5 opacity-50"}`}>
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-xl shrink-0">
                {getCategoryEmoji(r.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{r.note || r.category}</p>
                <p className="text-xs text-on-surface-variant">{formatCurrency(r.amount)} · {ORDINAL(r.dayOfMonth)} of each month</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle active */}
                <button
                  type="button"
                  onClick={() => toggleActive(r)}
                  title={r.active ? "Pause" : "Resume"}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">{r.active ? "pause" : "play_arrow"}</span>
                </button>
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {adding ? (
          <form onSubmit={handleAdd} className="space-y-3 shrink-0 border-t border-white/10 pt-4">
            <p className="font-label-caps text-label-caps text-on-surface-variant">New Recurring Expense</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="number" step="any" min="1" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount" required
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>
              <div>
                <input
                  type="number" min="1" max="28" value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="Day (1-28)" required
                  className="w-full px-3 py-2.5 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                    category === cat.value
                      ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary border-transparent"
                      : "bg-surface-container-high text-on-surface border-white/10"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <input
              type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Label (e.g. Netflix, Rent...)"
              className="w-full px-3 py-2.5 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex gap-2">
              <button type="button" onClick={() => setAdding(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-on-primary btn-grad active:scale-95 transition-all disabled:opacity-50">
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full py-3 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg pointer-events-none">add</span>
            <span className="pointer-events-none">Add Recurring Expense</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RecurringExpensesModal;
