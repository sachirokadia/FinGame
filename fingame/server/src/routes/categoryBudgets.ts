import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/category-budgets?month=6&year=2026
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const now = new Date();
  const month = parseInt(req.query.month as string) || now.getMonth() + 1;
  const year  = parseInt(req.query.year  as string) || now.getFullYear();

  try {
    const budgets = await prisma.categoryBudget.findMany({ where: { userId, month, year } });

    // Also return actual spend per category for this month
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59, 999);
    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
    });

    const spendMap: Record<string, number> = {};
    expenses.forEach((e) => { spendMap[e.category] = (spendMap[e.category] || 0) + e.amount; });

    const result = budgets.map((b) => ({
      ...b,
      spent: spendMap[b.category] || 0,
      remaining: b.amount - (spendMap[b.category] || 0),
      percentUsed: b.amount > 0 ? Math.round(((spendMap[b.category] || 0) / b.amount) * 100) : 0,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Get category budgets error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// PUT /api/category-budgets  — upsert a category budget
router.put("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { category, amount, month, year } = req.body;
  if (!category || amount === undefined) {
    return res.status(400).json({ error: "category and amount are required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return res.status(400).json({ error: "amount must be a non-negative number" });
  }

  const now = new Date();
  const m = parseInt(month) || now.getMonth() + 1;
  const y = parseInt(year)  || now.getFullYear();

  try {
    const existing = await prisma.categoryBudget.findFirst({ where: { userId, category, month: m, year: y } });

    let result;
    if (existing) {
      result = await prisma.categoryBudget.update({ where: { id: existing.id }, data: { amount: parsedAmount } });
    } else {
      result = await prisma.categoryBudget.create({ data: { userId, category, amount: parsedAmount, month: m, year: y } });
    }
    return res.json(result);
  } catch (error) {
    console.error("Upsert category budget error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// DELETE /api/category-budgets/:id
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const existing = await prisma.categoryBudget.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.categoryBudget.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete category budget error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
