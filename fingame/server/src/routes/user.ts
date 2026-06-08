import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { calculateLevel } from "../services/xpService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/user/me
router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, level: true, xp: true, streak: true, tourCompleted: true, monthlyBudget: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const levelInfo = calculateLevel(user.xp);
    return res.json({ ...user, ...levelInfo });
  } catch (error) {
    console.error("User me fetch error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/user/tour-complete
router.post("/tour-complete", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await prisma.user.update({ where: { id: userId }, data: { tourCompleted: true } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Tour complete error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/user/budget
router.get("/budget", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { monthlyBudget: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ monthlyBudget: user.monthlyBudget });
  } catch (error) {
    console.error("Get budget error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// PUT /api/user/budget  — saves to BudgetHistory before updating
router.put("/budget", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { monthlyBudget } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (monthlyBudget === undefined || monthlyBudget === null) {
    return res.status(400).json({ error: "monthlyBudget is required" });
  }

  const parsed = parseFloat(monthlyBudget);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: "monthlyBudget must be a positive number" });
  }
  if (parsed > 10_000_000) {
    return res.status(400).json({ error: "monthlyBudget cannot exceed ₹1,00,00,000" });
  }

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Upsert BudgetHistory for this month — one record per month
    await prisma.budgetHistory.upsert({
      where: {
        // Use a compound unique workaround by checking first
        id: (await prisma.budgetHistory.findFirst({ where: { userId, month, year } }))?.id ?? "new",
      },
      update: { amount: parsed, setAt: now },
      create: { userId, amount: parsed, month, year },
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { monthlyBudget: parsed },
      select: { monthlyBudget: true },
    });

    return res.json({ monthlyBudget: updated.monthlyBudget, message: "Budget updated successfully" });
  } catch (error) {
    console.error("Update budget error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/user/budget-history
router.get("/budget-history", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const history = await prisma.budgetHistory.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    });
    return res.json(history);
  } catch (error) {
    console.error("Budget history error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
