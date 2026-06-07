import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/stats/weekly
router.get("/weekly", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekExpenses = expenses.filter(e => new Date(e.date) >= startOfWeek);
    const lastWeekExpenses = expenses.filter(e => new Date(e.date) >= startOfLastWeek && new Date(e.date) < startOfWeek);

    const totalThisWeek = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLastWeek = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

    let percentageChange = 0;
    if (totalLastWeek > 0) {
      percentageChange = Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100);
    } else if (totalThisWeek > 0) {
      percentageChange = 100;
    }

    const dailySpend = Array(7).fill(0);
    thisWeekExpenses.forEach(e => {
      const day = (new Date(e.date).getDay() + 6) % 7;
      dailySpend[day] += e.amount;
    });

    const categoryTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      grandTotal += e.amount;
    });

    const categoriesList = Object.entries(categoryTotals).map(([name, value]) => {
      const percentage = grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0;
      return { name, amount: value, percentage };
    }).sort((a, b) => b.amount - a.amount);

    return res.json({
      totalThisWeek,
      totalLastWeek,
      percentageChange,
      dailySpend,
      topCategories: categoriesList.slice(0, 4),
    });
  } catch (error) {
    console.error("Weekly stats error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/stats/monthly  — monthly spend + budget summary
router.get("/monthly", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1; // 1-based

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const startOfPrevMonth = new Date(prevYear, prevMonth - 1, 1);
    const endOfPrevMonth = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    const [currentExpenses, prevExpenses] = await Promise.all([
      prisma.expense.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
        orderBy: { date: "asc" },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        orderBy: { date: "asc" },
      }),
    ]);

    const totalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevMonthTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = user.monthlyBudget - totalSpent;
    const percentUsed = user.monthlyBudget > 0
      ? Math.round((totalSpent / user.monthlyBudget) * 100)
      : 0;

    // Month-over-month change
    let monthOverMonthChange = 0;
    if (prevMonthTotal > 0) {
      monthOverMonthChange = Math.round(((totalSpent - prevMonthTotal) / prevMonthTotal) * 100);
    }

    // Daily breakdown for current month (for a spend-by-day chart)
    const daysInMonth = endOfMonth.getDate();
    const dailyBreakdown: { day: number; amount: number }[] = Array.from(
      { length: daysInMonth },
      (_, i) => ({ day: i + 1, amount: 0 })
    );
    currentExpenses.forEach(e => {
      const day = new Date(e.date).getDate();
      if (dailyBreakdown[day - 1]) {
        dailyBreakdown[day - 1].amount += e.amount;
      }
    });

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    currentExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Derived daily budget (how much per day to stay on track for remaining days)
    const today = now.getDate();
    const daysLeft = daysInMonth - today + 1;
    const dailyAllowance = daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0;

    return res.json({
      year,
      month,
      monthlyBudget: user.monthlyBudget,
      totalSpent,
      remaining,
      percentUsed,
      prevMonthTotal,
      monthOverMonthChange,
      daysInMonth,
      daysLeft,
      dailyAllowance,
      dailyBreakdown,
      topCategories,
      isOverBudget: remaining < 0,
    });
  } catch (error) {
    console.error("Monthly stats error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/stats/leaderboard
router.get("/leaderboard", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, level: true, xp: true, streak: true },
      orderBy: { xp: "desc" },
    });

    const rankedPlayers = users
      .sort((a, b) => b.xp - a.xp)
      .map((p, index) => ({
        ...p,
        rank: index + 1,
        isCurrentUser: p.id === userId,
      }));

    return res.json(rankedPlayers);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
