import React, { useState } from "react";
import { expensesAPI } from "../api";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { formatCurrency } from "../utils/format";
import type { Expense } from "../types";

interface EditExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSaved: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, onClose, onSaved }) => {
  const [amount, setAmount] = useState(String(expense?.amount ?? ""));
  const [category, setCategory] = useState(expense?.category ?? EXPENSE_CATEGORIES[0].value);
  const [note, setNote] = useState(expense?.note ?? "");
  const [date, setDate] = useState(
    expense ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!expense) return null;

  const parsed = parseFloat(amount);
  const isValid = !isNaN(parsed) && parsed > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { setError("Enter a valid amount greater than ₹0"); return; }
    setLoading(true);
    setError("");
    try {
      await expensesAPI.editExpense(expense.id, {
        amount: parsed,
        category,
        note: note || undefined,
        date,
      });
      onSaved();
      onClose();
    } catch {
      setError("Failed to update expense. Please try again.");
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-title-md text-title-md text-primary">Edit Expense</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Originally {formatCurrency(expense.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="text-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-on-surface-variant">₹</span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                className="w-full text-center text-4xl font-display-lg py-4 px-10 rounded-xl sunken-surface border border-outline-variant/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                required
              />
            </div>
          </div>

          {/* Category */}
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

          {/* Note */}
          <div>
            <label htmlFor="edit-note" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Note (optional)</label>
            <input
              id="edit-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="edit-date" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Date</label>
            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-label-caps text-label-caps border border-white/10 text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
