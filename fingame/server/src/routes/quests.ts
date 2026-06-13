import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/quests
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userQuests = await prisma.userQuest.findMany({
      where: { userId },
      include: { quest: true },
    });
    return res.json(userQuests);
  } catch (error) {
    console.error("Fetch quests error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/quests/:id/update
// Note: /:id/update is safe — no static routes conflict with this pattern
router.post("/:id/update", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { progress } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Fix: use strict undefined check so progress=0 is valid
  if (progress === undefined || progress === null) {
    return res.status(400).json({ error: "Progress value is required" });
  }

  try {
    const parsedProgress = parseFloat(progress);
    if (isNaN(parsedProgress)) return res.status(400).json({ error: "Progress must be a number" });

    const userQuest = await prisma.userQuest.findFirst({
      where: { id, userId },
      include: { quest: true },
    });

    if (!userQuest) return res.status(404).json({ error: "Quest not found for this user" });

    const isCompleted      = parsedProgress >= userQuest.quest.targetValue;
    const wasAlreadyDone   = userQuest.completed;

    const updatedUserQuest = await prisma.userQuest.update({
      where: { id: userQuest.id },
      data:  { progress: Math.min(parsedProgress, userQuest.quest.targetValue), completed: isCompleted },
    });

    // Award XP only on first completion
    if (isCompleted && !wasAlreadyDone) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data:  { xp: user.xp + userQuest.quest.xpReward },
        });
      }
    }

    return res.json(updatedUserQuest);
  } catch (error) {
    console.error("Update quest error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
