import React, { useEffect, useState } from "react";
import { categoryBudgetsAPI } from "../api";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { formatCurrency, getCategoryEmoji } from "../utils/format";

interface CategoryBudget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

interface Props { isOpen: boolean; onClose: () => void; }

const CategoryBudgetsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [budgets, setBudgets]       = useState<CategoryBudget[]>([]);
  const [loading, setLoading]       = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoryBudgetsAPI.getCategoryBudgets();
      setBudgets(res.data);
    } catch { setError("Could not load category budgets."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) { load(); setError(""); } }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (category: string) => {
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed < 0) { setError("Enter a valid amount"); return; }
    setSaving(true); setError("");
    try {
      await categoryBudgetsAPI.upsertCategoryBudget({ category, amount: parsed });
      setEditingCat(null); setEditAmount("");
      await load();
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryBudgetsAPI.deleteCategoryBudget(id);
      await load();
    } catch { setError("Failed to delete."); }
  };

  // Merge EXPENSE_CATEGORIES with existing budgets
  const rows = EXPENSE_CATEGORIES.map((cat) => {
    const existing = budgets.find((b) => b.category === cat.value);
    return { cat, budget: existing ?? null };
  });

  const getBarColor = (pct: number) => {
    if (pct >= 100) return "bg-error";
    if (pct >= 75)  return "bg-tertiary";
    return "bg-gradient-to-r from-primary to-secondary";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-in max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="font-title-md text-title-md text-primary">Category Budgets</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Set spending limits per category</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg mb-3 shrink-0">{error}</p>}

        <div className="flex-1 overflow-y-auto space-y-3">
          {loading && <p className="text-center text-on-surface-variant text-sm py-8">Loading...</p>}

          {rows.map(({ cat, budget }) => (
            <div key={cat.value} className="bg-surface-container-high rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-semibold text-sm text-on-surface">{cat.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {budget ? (
                    <>
                      <span className={`text-xs font-bold ${budget.percentUsed >= 100 ? "text-error" : budget.percentUsed >= 75 ? "text-tertiary" : "text-secondary"}`}>
                        {budget.percentUsed}%
                      </span>
                      <button type="button" onClick={() => { setEditingCat(cat.value); setEditAmount(String(budget.amount)); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button type="button" onClick={() => handleDelete(budget.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => { setEditingCat(cat.value); setEditAmount(""); }}
                      className="text-xs font-bold text-primary hover:underline">
                      + Set limit
                    </button>
                  )}
                </div>
              </div>

              {/* Inline edit */}
              {editingCat === cat.value && (
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">₹</span>
                    <input type="number" step="any" min="0" value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="e.g. 3000" autoFocus
                      className="w-full pl-7 pr-3 py-2 rounded-lg sunken-surface border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                    />
                  </div>
                  <button type="button" disabled={saving} onClick={() => handleSave(cat.value)}
                    className="px-3 py-2 rounded-lg btn-grad text-on-primary text-xs font-bold disabled:opacity-50 active:scale-95 transition-all">
                    {saving ? "..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditingCat(null)}
                    className="px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant text-xs active:scale-95 transition-all">
                    Cancel
                  </button>
                </div>
              )}

              {/* Progress bar */}
              {budget && (
                <>
                  <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full transition-all duration-500 ${getBarColor(budget.percentUsed)}`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>{formatCurrency(budget.spent)} spent</span>
                    <span className={budget.remaining < 0 ? "text-error font-bold" : ""}>
                      {budget.remaining < 0 ? `${formatCurrency(-budget.remaining)} over` : `${formatCurrency(budget.remaining)} left`}
                    </span>
                    <span>of {formatCurrency(budget.amount)}</span>
                  </div>
                </>
              )}

              {!budget && editingCat !== cat.value && (
                <p className="text-xs text-on-surface-variant">No limit set</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBudgetsModal;
