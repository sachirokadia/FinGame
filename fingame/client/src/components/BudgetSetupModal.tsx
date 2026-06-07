import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import { DEFAULT_MONTHLY_BUDGET } from "../utils/constants";

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [5000, 10000, 15000, 20000, 30000, 50000];

const BudgetSetupModal: React.FC<BudgetSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, updateBudget } = useAuth();
  const [amount, setAmount] = useState(
    String(user?.monthlyBudget ?? DEFAULT_MONTHLY_BUDGET)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const parsed = parseFloat(amount);
  const isValid = !isNaN(parsed) && parsed > 0;

  // Derived daily allowance preview
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailyPreview = isValid ? parsed / daysInMonth : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please enter a valid budget greater than ₹0");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateBudget(parsed);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch {
      setError("Failed to save budget. Please try again.");
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
            <h2 className="font-title-md text-title-md text-primary">Monthly Budget</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Set your total spend limit for the month
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
          {/* Amount input */}
          <div className="text-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Monthly Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-on-surface-variant">
                ₹
              </span>
              <input
                type="number"
                step="100"
                min="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="w-full text-center text-4xl font-display-lg py-4 px-10 rounded-xl sunken-surface border border-outline-variant/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                placeholder="10000"
                required
              />
            </div>
          </div>

          {/* Quick-pick chips */}
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Quick Pick
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setAmount(String(q));
                    setError("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                    parseFloat(amount) === q
                      ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary border-transparent"
                      : "bg-surface-container-high text-on-surface border-white/10 hover:border-primary/30"
                  }`}
                >
                  {formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview card */}
          {isValid && (
            <div className="bg-surface-container-high rounded-xl p-4 border border-white/10 space-y-2">
              <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">
                Budget Breakdown
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Monthly limit</span>
                <span className="text-primary font-semibold">{formatCurrency(parsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Daily allowance</span>
                <span className="text-secondary font-semibold">{formatCurrency(dailyPreview)}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Per week (avg)</span>
                <span className="text-on-surface font-semibold">{formatCurrency((parsed / 52) * 7 / 12 * 52)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all disabled:opacity-50"
          >
            {success ? "✓ Saved!" : loading ? "Saving..." : "Set Budget →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetSetupModal;
