import { calculateLevel } from "./xpService.js";
import { prisma } from "../lib/prisma.js";

function isFoodCategory(category: string): boolean {
  const c = category.toLowerCase();
  return c.includes("🍔") || c.includes("food") || c.includes("dining");
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
}

function getDailySpendMap(expenses: { amount: number; date: Date }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const key = startOfDay(new Date(e.date)).toISOString();
    map.set(key, (map.get(key) ?? 0) + e.amount);
  }
  return map;
}

function countConsecutiveUnderBudgetDays(
  dailySpend: Map<string, number>,
  fromDate: Date,
  dailyBudget: number
): number {
  let count = 0;
  const cursor = startOfDay(fromDate);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString();
    const spent = dailySpend.get(key) ?? 0;
    if (spent > 0 && spent <= dailyBudget) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (spent === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

function countConsecutiveNoFoodDays(
  expenses: { category: string; date: Date }[],
  fromDate: Date
): number {
  const byDay = new Map<string, { hasFood: boolean }>();
  for (const e of expenses) {
    const key = startOfDay(new Date(e.date)).toISOString();
    const existing = byDay.get(key) ?? { hasFood: false };
    if (isFoodCategory(e.category)) existing.hasFood = true;
    byDay.set(key, existing);
  }

  let count = 0;
  const cursor = startOfDay(fromDate);
  for (let i = 0; i < 30; i++) {
    const key = cursor.toISOString();
    const day = byDay.get(key);
    if (day && !day.hasFood) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (!day) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

async function completeQuestAndAwardXp(
  userId: string,
  userQuestId: string,
  xpReward: number
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newXp = user.xp + xpReward;
  const { level: newLevel } = calculateLevel(newXp);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });
}

export async function evaluateQuestsForUser(userId: string) {
  try {
    // Fetch user's monthlyBudget so quest logic can derive a daily budget
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    // Derive a daily budget from the monthly budget (averaged over 30 days)
    const dailyBudget = user ? user.monthlyBudget / 30 : 1000;

    const userQuests = await prisma.userQuest.findMany({
      where: { userId, completed: false },
      include: { quest: true },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const today = startOfDay(new Date());
    const dailySpend = getDailySpendMap(expenses);
    const weekStart = getMondayOfWeek(today);
    const weeklySpend = expenses
      .filter((e) => startOfDay(new Date(e.date)) >= weekStart)
      .reduce((sum, e) => sum + e.amount, 0);

    const underBudgetStreak = countConsecutiveUnderBudgetDays(dailySpend, today, dailyBudget);
    const noFoodStreak = countConsecutiveNoFoodDays(expenses, today);
    const totalExpenseCount = expenses.length;
    const latestExpense = expenses[0];

    for (const uq of userQuests) {
      let progressUpdate = uq.progress;
      let isCompleted = false;
      const { quest } = uq;

      switch (quest.name) {
        case "First Save":
          if (totalExpenseCount >= 1) {
            progressUpdate = 1;
            isCompleted = true;
          }
          break;

        case "Home Chef Streak":
          progressUpdate = Math.min(noFoodStreak, quest.targetValue);
          isCompleted = progressUpdate >= quest.targetValue;
          break;

        case "Vault Builder":
          if (latestExpense) {
            const note = latestExpense.note?.toLowerCase() ?? "";
            const isSavings =
              note.includes("save") ||
              note.includes("fund") ||
              note.includes("emergency") ||
              latestExpense.category.includes("💰");
            if (isSavings) {
              progressUpdate = Math.min(uq.progress + latestExpense.amount, quest.targetValue);
            }
          }
          const savedFromBudget = Array.from(dailySpend.entries()).reduce((sum, [, spent]) => {
            return sum + Math.max(0, dailyBudget - spent);
          }, 0);
          progressUpdate = Math.max(progressUpdate, Math.min(savedFromBudget, quest.targetValue));
          isCompleted = progressUpdate >= quest.targetValue;
          break;

        case "Budget Boss":
          progressUpdate = Math.min(underBudgetStreak, quest.targetValue);
          isCompleted = progressUpdate >= quest.targetValue;
          break;

        case "Frugal Week":
          // Scale the frugal week target relative to the user's weekly budget
          const weeklyBudget = dailyBudget * 7;
          const frugalTarget = Math.min(quest.targetValue, weeklyBudget * 0.5);
          progressUpdate = weeklySpend;
          isCompleted = weeklySpend > 0 && weeklySpend <= frugalTarget;
          break;

        default:
          break;
      }

      if (progressUpdate !== uq.progress || isCompleted) {
        await prisma.userQuest.update({
          where: { id: uq.id },
          data: { progress: progressUpdate, completed: isCompleted },
        });

        if (isCompleted && !uq.completed) {
          await completeQuestAndAwardXp(userId, uq.id, quest.xpReward);
        }
      }
    }
  } catch (error) {
    console.error("Error evaluating quests:", error);
  }
}
