import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fingame_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (data: LoginCredentials) => api.post("/auth/login", data),
  register: (data: RegisterCredentials) => api.post("/auth/register", data),
};

export const userAPI = {
  getProfile: () => api.get("/user/me"),
  completeTour: () => api.post("/user/tour-complete"),
  getBudget: () => api.get("/user/budget"),
  updateBudget: (monthlyBudget: number) => api.put("/user/budget", { monthlyBudget }),
};

export const expensesAPI = {
  getExpenses: () => api.get("/expenses"),
  addExpense: (data: { amount: number; category: string; note?: string; date?: string }) =>
    api.post("/expenses", data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
};

export const questsAPI = {
  getQuests: () => api.get("/quests"),
  updateQuestProgress: (id: string, progress: number) =>
    api.post(`/quests/${id}/update`, { progress }),
};

export const badgesAPI = {
  getBadges: () => api.get("/badges"),
};

export const statsAPI = {
  getWeeklyStats: () => api.get("/stats/weekly"),
  getMonthlyStats: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append("year", String(year));
    if (month) params.append("month", String(month));
    return api.get(`/stats/monthly?${params.toString()}`);
  },
  getLeaderboard: () => api.get("/stats/leaderboard"),
};

export default api;
