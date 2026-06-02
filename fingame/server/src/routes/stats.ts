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
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1); // Monday
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter current and last week expenses
    const thisWeekExpenses = expenses.filter(e => new Date(e.date) >= startOfWeek);
    const lastWeekExpenses = expenses.filter(e => new Date(e.date) >= startOfLastWeek && new Date(e.date) < startOfWeek);

    const totalThisWeek = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLastWeek = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate percentage change
    let percentageChange = 0;
    if (totalLastWeek > 0) {
      percentageChange = Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100);
    } else if (totalThisWeek > 0) {
      percentageChange = 100; // If there was no spending last week
    }

    // Daily spending intensity heatmap (Monday = 0 to Sunday = 6)
    const dailySpend = Array(7).fill(0);
    thisWeekExpenses.forEach(e => {
      const day = (new Date(e.date).getDay() + 6) % 7; // Convert Sun=0, Mon=1 to Mon=0, Sun=6
      dailySpend[day] += e.amount;
    });

    // Top Power-Ups (Categories) spending aggregates
    const categoryTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      grandTotal += e.amount;
    });

    const categoriesList = Object.entries(categoryTotals).map(([name, value]) => {
      const percentage = grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0;
      return {
        name,
        amount: value,
        percentage,
      };
    }).sort((a, b) => b.amount - a.amount);

    return res.json({
      totalThisWeek,
      totalLastWeek,
      percentageChange,
      dailySpend,
      topCategories: categoriesList.slice(0, 4), // Top 4 categories
    });
  } catch (error) {
    console.error("Weekly stats error:", error);
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
    // Query all users from db
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
        streak: true,
      },
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
