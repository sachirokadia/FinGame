import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { calculateLevel } from "../services/xpService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/user/me
router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        streak: true,
        tourCompleted: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get exact level mapping metrics
    const levelInfo = calculateLevel(user.xp);

    return res.json({
      ...user,
      ...levelInfo,
    });
  } catch (error) {
    console.error("User me fetch error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/user/tour-complete
router.post("/tour-complete", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tourCompleted: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Tour complete error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
