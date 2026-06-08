import React, { useEffect, useState } from "react";
import { userAPI } from "../api";
import { formatCurrency } from "../utils/format";
import { MONTH_NAMES } from "../utils/constants";
import type { BudgetHistory } from "../types";

interface BudgetHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
}

const BudgetHistoryModal: React.FC<BudgetHistoryModalProps> = ({ isOpen, onClose, currentBudget }) => {
  const [history, setHistory] = useState<BudgetHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    userAPI.getBudgetHistory()
      .then((res) => setHistory(res.data))
      .catch(() => setError("Could not load budget history."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-in" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-title-md text-title-md text-primary">Budget History</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Your monthly budget over time</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg mb-4">{error}</p>}

        {loading && <p className="text-on-surface-variant text-sm text-center py-8">Loading...</p>}

        {!loading && history.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">history</span>
            <p className="text-on-surface-variant text-sm">No history yet. Your budget changes will be recorded here.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-2">
            {/* Current month (live) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">today</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {MONTH_NAMES[thisMonth - 1]} {thisYear}
                  </p>
                  <p className="text-xs text-primary font-bold">Current</p>
                </div>
              </div>
              <span className="text-primary font-bold text-sm">{formatCurrency(currentBudget)}</span>
            </div>

            {/* History rows */}
            {history.map((h, idx) => {
              const isCurrentMonth = h.month === thisMonth && h.year === thisYear;
              if (isCurrentMonth) return null; // already shown above
              const prev = history[idx + 1];
              const changed = prev ? h.amount !== prev.amount : false;
              const increased = prev ? h.amount > prev.amount : false;

              return (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {MONTH_NAMES[h.month - 1]} {h.year}
                      </p>
                      {changed && (
                        <p className={`text-xs font-bold ${increased ? "text-error" : "text-secondary"}`}>
                          {increased ? "▲" : "▼"} {increased ? "Increased" : "Decreased"}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-on-surface font-semibold text-sm">{formatCurrency(h.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetHistoryModal;
