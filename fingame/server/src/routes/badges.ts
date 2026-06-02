import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/badges
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const allBadges = await prisma.badge.findMany({});
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
    });

    const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub.earnedAt]));

    const response = allBadges.map(badge => {
      const earned = userBadgeMap.has(badge.id);
      return {
        ...badge,
        earned,
        earnedAt: earned ? userBadgeMap.get(badge.id) : null,
      };
    });

    return res.json(response);
  } catch (error) {
    console.error("Fetch badges error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
