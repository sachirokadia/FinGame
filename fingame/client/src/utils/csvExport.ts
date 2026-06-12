import type { Expense } from "../types";

export function exportExpensesToCSV(expenses: Expense[], filename = "fingame-expenses.csv") {
  const headers = ["Date", "Category", "Note", "Amount (₹)", "XP Awarded", "Recurring"];

  const rows = expenses.map((e) => [
    new Date(e.date).toLocaleDateString("en-IN"),
    e.category,
    e.note ?? "",
    e.amount.toFixed(2),
    e.xpAwarded,
    e.isRecurring ? "Yes" : "No",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
