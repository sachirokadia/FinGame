import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { calculateXpForExpense, calculateLevel } from "../services/xpService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/recurring
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(recurring);
  } catch (error) {
    console.error("Fetch recurring error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/recurring/process — MUST be before /:id to avoid route conflict
router.post("/process", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const now       = new Date();
    const today     = now.getDate();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const actives = await prisma.recurringExpense.findMany({
      where: { userId, active: true },
    });

    const logged: string[] = [];

    for (const r of actives) {
      if (r.dayOfMonth !== today) continue;

      const lastLogged = r.lastLoggedAt ? new Date(r.lastLoggedAt) : null;
      if (
        lastLogged &&
        lastLogged.getMonth() === thisMonth &&
        lastLogged.getFullYear() === thisYear
      ) continue;

      const xpAwarded = calculateXpForExpense(r.category);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) continue;

      await prisma.expense.create({
        data: {
          userId,
          amount:      r.amount,
          category:    r.category,
          note:        r.note,
          date:        now,
          xpAwarded,
          isRecurring: true,
          recurringId: r.id,
        },
      });

      const newXp = user.xp + xpAwarded;
      const { level: newLevel } = calculateLevel(newXp);

      await prisma.user.update({
        where: { id: userId },
        data:  { xp: newXp, level: newLevel },
      });

      await prisma.recurringExpense.update({
        where: { id: r.id },
        data:  { lastLoggedAt: now },
      });

      logged.push(r.note || r.category);
    }

    return res.json({ processed: logged.length, logged });
  } catch (error) {
    console.error("Process recurring error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/recurring — add new
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount, category, dayOfMonth, note } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (amount === undefined || amount === null || !category || dayOfMonth === undefined) {
    return res.status(400).json({ error: "amount, category and dayOfMonth are required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const day = parseInt(dayOfMonth);
  if (isNaN(day) || day < 1 || day > 28) {
    return res.status(400).json({ error: "dayOfMonth must be between 1 and 28" });
  }

  try {
    const recurring = await prisma.recurringExpense.create({
      data: {
        userId,
        amount:     parsedAmount,
        category,
        note:       note || null,
        dayOfMonth: day,
        active:     true,
      },
    });
    return res.status(201).json(recurring);
  } catch (error) {
    console.error("Create recurring error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// PATCH /api/recurring/:id — toggle active or edit fields
router.patch("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { amount, category, note, dayOfMonth, active } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing)                  return res.status(404).json({ error: "Recurring expense not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        ...(amount     !== undefined && { amount:     parseFloat(amount) }),
        ...(category   !== undefined && { category }),
        ...(note       !== undefined && { note: note || null }),
        ...(dayOfMonth !== undefined && { dayOfMonth: parseInt(dayOfMonth) }),
        ...(active     !== undefined && { active }),
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error("Update recurring error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// DELETE /api/recurring/:id
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing)                  return res.status(404).json({ error: "Not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.recurringExpense.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete recurring error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
