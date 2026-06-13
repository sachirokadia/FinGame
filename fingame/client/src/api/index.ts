import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface LoginCredentials { email: string; password: string; }
export interface RegisterCredentials { name: string; email: string; password: string; }

const api = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fingame_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login:    (data: LoginCredentials)    => api.post("/auth/login", data),
  register: (data: RegisterCredentials) => api.post("/auth/register", data),
};

export const userAPI = {
  getProfile:       () => api.get("/user/me"),
  completeTour:     () => api.post("/user/tour-complete"),
  getBudget:        () => api.get("/user/budget"),
  updateBudget:     (monthlyBudget: number) => api.put("/user/budget", { monthlyBudget }),
  getBudgetHistory: () => api.get("/user/budget-history"),
};

export const expensesAPI = {
  getExpenses:   () => api.get("/expenses"),
  addExpense:    (data: { amount: number; category: string; note?: string; date?: string }) =>
    api.post("/expenses", data),
  editExpense:   (id: string, data: { amount?: number; category?: string; note?: string; date?: string }) =>
    api.patch(`/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
};

export const categoryBudgetsAPI = {
  getCategoryBudgets:   (month?: number, year?: number) => {
    const p = new URLSearchParams();
    if (month) p.append("month", String(month));
    if (year)  p.append("year",  String(year));
    return api.get(`/category-budgets?${p.toString()}`);
  },
  upsertCategoryBudget: (data: { category: string; amount: number; month?: number; year?: number }) =>
    api.put("/category-budgets", data),
  deleteCategoryBudget: (id: string) => api.delete(`/category-budgets/${id}`),
};

export const questsAPI = {
  getQuests:           () => api.get("/quests"),
  updateQuestProgress: (id: string, progress: number) =>
    api.post(`/quests/${id}/update`, { progress }),
};

export const badgesAPI  = { getBadges: () => api.get("/badges") };

export const statsAPI = {
  getWeeklyStats:  () => api.get("/stats/weekly"),
  getMonthlyStats: (year?: number, month?: number) => {
    const p = new URLSearchParams();
    if (year)  p.append("year",  String(year));
    if (month) p.append("month", String(month));
    return api.get(`/stats/monthly?${p.toString()}`);
  },
  getLeaderboard: () => api.get("/stats/leaderboard"),
};

export default api;
