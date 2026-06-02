import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/quests
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Fetch all user quests
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
router.post("/:id/update", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // uqId or questId
  const { progress } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (progress === undefined) {
    return res.status(400).json({ error: "Progress value is required" });
  }

  try {
    const parsedProgress = parseFloat(progress);

    // Find the UserQuest record
    const userQuest = await prisma.userQuest.findFirst({
      where: {
        id,
        userId,
      },
      include: { quest: true },
    });

    if (!userQuest) {
      return res.status(404).json({ error: "Quest progress record not found for this user" });
    }

    const isCompleted = parsedProgress >= userQuest.quest.targetValue;
    const oldCompletedState = userQuest.completed;

    const updatedUserQuest = await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        progress: Math.min(parsedProgress, userQuest.quest.targetValue),
        completed: isCompleted,
      },
    });

    // If quest was just completed, award XP
    if (isCompleted && !oldCompletedState) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: user.xp + userQuest.quest.xpReward,
          },
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
