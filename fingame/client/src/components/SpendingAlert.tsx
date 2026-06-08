import React, { useState } from "react";
import { formatCurrency } from "../utils/format";

interface SpendingAlertProps {
  percentUsed: number;
  monthlyBudget: number;
  spent: number;
}

const THRESHOLDS = [
  { pct: 90, label: "90% used", color: "border-error/50 bg-error/10 text-error", icon: "emergency", iconColor: "text-error" },
  { pct: 75, label: "75% used", color: "border-tertiary/50 bg-tertiary/10 text-tertiary", icon: "warning", iconColor: "text-tertiary" },
  { pct: 50, label: "50% used", color: "border-primary/40 bg-primary/10 text-primary", icon: "info", iconColor: "text-primary" },
];

const SpendingAlert: React.FC<SpendingAlertProps> = ({ percentUsed, monthlyBudget, spent }) => {
  const [dismissed, setDismissed] = useState<number | null>(null);

  // Find the highest triggered threshold that hasn't been dismissed
  const active = THRESHOLDS.find(
    (t) => percentUsed >= t.pct && dismissed !== t.pct
  );

  if (!active) return null;

  const remaining = monthlyBudget - spent;

  const messages: Record<number, string> = {
    90: `Almost out of budget! Only ${formatCurrency(remaining)} left this month.`,
    75: `You've used 75% of your budget. ${formatCurrency(remaining)} remaining.`,
    50: `Halfway through your budget. ${formatCurrency(remaining)} still available.`,
  };

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-4 ${active.color}`}>
      <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${active.iconColor}`}
        style={{ fontVariationSettings: "'FILL' 1" }}>
        {active.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{active.label} this month</p>
        <p className="text-xs opacity-80 mt-0.5">{messages[active.pct]}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(active.pct)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

export default SpendingAlert;
