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
};

export type BudgetHistory = {
  id: string;
  amount: number;
  month: number;
  year: number;
  setAt: string;
};

export type CategoryBudget = {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentUsed: number;
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
