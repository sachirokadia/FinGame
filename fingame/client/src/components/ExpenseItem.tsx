import React, { useState } from "react";
import { XPChip } from "./ui/XPChip";
import { formatCurrency, formatDate, getCategoryEmoji } from "../utils/format";
import type { Expense } from "../types";

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onDelete, onEdit }) => {
  const [deleting, setDeleting] = useState(false);
  const emoji = getCategoryEmoji(expense.category);
  const label = expense.note || expense.category.replace(/^[\p{Emoji}\s]+/u, "").trim() || "Expense";

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(expense.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-xl shrink-0 border border-white/10 relative">
          {emoji}
          {expense.isRecurring && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center" title="Recurring">
              <span className="material-symbols-outlined text-[10px] text-on-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>repeat</span>
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-title-md text-sm text-on-surface truncate">{label}</p>
          <p className="text-xs text-on-surface-variant">
            {expense.category.replace(/^[\p{Emoji}\s]+/u, "").trim()} · {formatDate(expense.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <div className="flex flex-col items-end gap-1 mr-1">
          <span className="text-error font-semibold text-sm">-{formatCurrency(expense.amount)}</span>
          <XPChip xp={expense.xpAwarded} />
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete expense"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">{deleting ? "hourglass_empty" : "delete"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
