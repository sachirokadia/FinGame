import { DAILY_BUDGET } from "./constants";
import type { Expense } from "../types";

export function isSameCalendarDay(a: Date | string, b: Date | string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function getSpendForDate(expenses: Expense[], date: Date | string): number {
  return expenses
    .filter((e) => isSameCalendarDay(e.date, date))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getDailyRemaining(expenses: Expense[], date: Date | string): number {
  return DAILY_BUDGET - getSpendForDate(expenses, date);
}
