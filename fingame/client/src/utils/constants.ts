/** Default monthly budget (INR) — used only before the user sets their own */
export const DEFAULT_MONTHLY_BUDGET = 10000;

export const EXPENSE_CATEGORIES = [
  { emoji: "🍔", label: "Food", value: "🍔 Food" },
  { emoji: "☕", label: "Coffee", value: "☕ Coffee" },
  { emoji: "🚗", label: "Transport", value: "🚗 Transport" },
  { emoji: "🛍️", label: "Shopping", value: "🛍️ Shopping" },
  { emoji: "⚡", label: "Utilities", value: "⚡ Utilities" },
  { emoji: "🎮", label: "Gaming", value: "🎮 Gaming" },
] as const;

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEMO_EMAIL = "hero@fingame.com";
export const DEMO_PASSWORD = "password123";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
