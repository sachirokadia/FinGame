import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { calculateXpForExpense, calculateLevel } from "../services/xpService.js";
import { evaluateQuestsForUser } from "../services/questService.js";
import { evaluateBadgesForUser } from "../services/badgeService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/expenses
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return res.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/expenses
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount, category, note, date } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (amount === undefined || !category) {
    return res.status(400).json({ error: "Amount and category are required" });
  }

  try {
    const parsedAmount = parseFloat(amount);
    const expenseDate = date ? new Date(date) : new Date();

    // 1. Calculate XP Awarded for this category
    const xpAwarded = calculateXpForExpense(category);

    // 2. Fetch User to determine streak and level recalculations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { expenses: { orderBy: { date: "desc" } } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Recalculate Streak
    let newStreak = user.streak;
    const previousExpenses = user.expenses;

    if (previousExpenses.length === 0) {
      newStreak = 1;
    } else {
      // Find the most recent expense date
      const mostRecentExpense = previousExpenses[0];
      const mostRecentDate = new Date(mostRecentExpense.date);

      // Reset hours to compare calendar days
      const d1 = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
      const d2 = new Date(mostRecentDate.getFullYear(), mostRecentDate.getMonth(), mostRecentDate.getDate());
      
      const diffTime = d1.getTime() - d2.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged on consecutive day
        newStreak = user.streak + 1;
      } else if (diffDays > 1) {
        // Broken streak, reset
        newStreak = 1;
      } else if (diffDays === 0) {
        // Multiple expenses on the same day, maintain streak
        newStreak = user.streak;
      } else {
        // Logged in the past
        newStreak = user.streak;
      }
    }

    // Ensure streak is at least 1 since they just logged something
    if (newStreak === 0) {
      newStreak = 1;
    }

    // 4. Save the new expense
    const newExpense = await prisma.expense.create({
      data: {
        userId,
        amount: parsedAmount,
        category,
        note: note || null,
        date: expenseDate,
        xpAwarded,
      },
    });

    // 5. Calculate new XP and Level
    const newXp = user.xp + xpAwarded;
    const { level: newLevel } = calculateLevel(newXp);
    const leveledUp = newLevel > user.level;

    // 6. Update user's profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        streak: newStreak,
      },
    });

    // 7. Evaluate active Quests
    await evaluateQuestsForUser(userId);

    // 8. Evaluate Badges
    await evaluateBadgesForUser(userId);

    return res.status(201).json({
      expense: newExpense,
      xpAwarded,
      newXp,
      newLevel,
      newStreak,
      leveledUp,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.userId !== userId) {
      return res.status(403).json({ error: "Forbidden. You do not own this expense." });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
