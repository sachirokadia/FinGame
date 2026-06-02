import { prisma } from "../lib/prisma.js";

export async function evaluateBadgesForUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: { badge: true },
        },
        expenses: true,
      },
    });

    if (!user) return;

    // Fetch all available badges
    const allBadges = await prisma.badge.findMany({});
    
    // Get list of already earned badge names/IDs
    const earnedBadgeIds = new Set(user.badges.map(ub => ub.badgeId));

    const totalExpenseCount = user.expenses.length;
    const foodExpenseCount = user.expenses.filter(
      e => e.category.includes("🍔") || e.category.toLowerCase().includes("food")
    ).length;

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue; // already earned

      let shouldUnlock = false;

      // Unlocking rules
      if (badge.name === "First Save" && totalExpenseCount >= 1) {
        shouldUnlock = true;
      } else if (badge.name === "Budget King" && user.xp >= 200) {
        shouldUnlock = true;
      } else if (badge.name === "Investor" && user.xp >= 500) {
        shouldUnlock = true;
      } else if (badge.name === "Protector" && user.xp >= 1000) {
        shouldUnlock = true;
      } else if (badge.name === "Whale" && user.xp >= 2000) {
        shouldUnlock = true;
      } else if (badge.name === "Ramen Warrior" && foodExpenseCount >= 3) {
        shouldUnlock = true;
      } else if (badge.name === "Streak Lord" && user.streak >= 5) {
        shouldUnlock = true;
      } else if (badge.name === "Wealth Wizard" && user.xp >= 750) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        // Unlock badge!
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
          },
        });
        console.log(`Unlocked badge "${badge.name}" for user ${user.name}`);
      }
    }
  } catch (error) {
    console.error("Error evaluating badges:", error);
  }
}
