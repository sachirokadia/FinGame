import type { Expense } from "../types";

/** Returns true if two date values fall on the same calendar day */
export function isSameCalendarDay(a: Date | string, b: Date | string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/** Returns true if two date values fall in the same month & year */
export function isSameMonth(a: Date | string, b: Date | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

/** Total spend for a specific calendar date */
export function getSpendForDate(expenses: Expense[], date: Date | string): number {
  return expenses
    .filter((e) => isSameCalendarDay(e.date, date))
    .reduce((sum, e) => sum + e.amount, 0);
}

/** Total spend for a given month (Date object or string) */
export function getMonthlySpend(expenses: Expense[], date: Date | string = new Date()): number {
  return expenses
    .filter((e) => isSameMonth(e.date, date))
    .reduce((sum, e) => sum + e.amount, 0);
}

/** Remaining monthly budget */
export function getMonthlyRemaining(
  expenses: Expense[],
  monthlyBudget: number,
  date: Date | string = new Date()
): number {
  return monthlyBudget - getMonthlySpend(expenses, date);
}

/**
 * Derived daily allowance: how much can the user spend per day
 * for the rest of the current month to stay on budget.
 */
export function getDerivedDailyAllowance(
  expenses: Expense[],
  monthlyBudget: number,
  date: Date = new Date()
): number {
  const remaining = getMonthlyRemaining(expenses, monthlyBudget, date);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const today = date.getDate();
  const daysLeft = daysInMonth - today + 1; // include today
  if (daysLeft <= 0 || remaining <= 0) return 0;
  return remaining / daysLeft;
}

/** Percentage of monthly budget used (0–100+) */
export function getBudgetPercentUsed(
  expenses: Expense[],
  monthlyBudget: number,
  date: Date | string = new Date()
): number {
  if (monthlyBudget <= 0) return 0;
  return (getMonthlySpend(expenses, date) / monthlyBudget) * 100;
}

// ── Legacy daily helpers (kept for backward compat in AddExpenseModal) ──────

/** @deprecated Use getMonthlyRemaining + getDerivedDailyAllowance instead */
export function getDailyRemaining(expenses: Expense[], date: Date | string): number {
  return getSpendForDate(expenses, date); // returns spend, caller subtracts from budget
}
