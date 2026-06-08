export type UserProfile = {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  xpInCurrentLevel?: number;
  xpForNextLevel?: number;
  tourCompleted?: boolean;
  monthlyBudget: number;
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  xpAwarded: number;
  isRecurring?: boolean;
};

export type RecurringExpense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  dayOfMonth: number;
  active: boolean;
  lastLoggedAt: string | null;
};

export type BudgetHistory = {
  id: string;
  amount: number;
  month: number;
  year: number;
  setAt: string;
};

export type QuestData = {
  id: string;
  progress: number;
  completed: boolean;
  quest: {
    id: string;
    name: string;
    description: string;
    xpReward: number;
    targetValue: number;
    type: string;
  };
};

export type BadgeData = {
  id: string;
  name: string;
  icon: string;
  xpRequired: number;
  earned: boolean;
};

export type LeaderboardPlayer = {
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
};
