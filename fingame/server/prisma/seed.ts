import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  await prisma.userBadge.deleteMany({});
  await prisma.userQuest.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.quest.deleteMany({});
  await prisma.user.deleteMany({});

  const quests = [
    { name: "Vault Builder", description: "Save ₹500 in your Emergency Fund", xpReward: 500, targetValue: 500, type: "save" },
    { name: "Home Chef Streak", description: "No Dining Out for 3 days", xpReward: 200, targetValue: 3, type: "streak" },
    { name: "Budget Boss", description: "Under limit for 7 consecutive days!", xpReward: 500, targetValue: 7, type: "limit" },
    { name: "Frugal Week", description: "Spend less than ₹150 total this week", xpReward: 300, targetValue: 150, type: "limit" },
    { name: "First Save", description: "Log your first expense or saving milestone", xpReward: 100, targetValue: 1, type: "save" },
  ];

  const dbQuests = [];
  for (const q of quests) {
    dbQuests.push(await prisma.quest.create({ data: q }));
  }

  const badges = [
    { name: "First Save", icon: "workspace_premium", xpRequired: 0 },
    { name: "Budget King", icon: "eco", xpRequired: 200 },
    { name: "Investor", icon: "auto_graph", xpRequired: 500 },
    { name: "Protector", icon: "shield", xpRequired: 1000 },
    { name: "Whale", icon: "diamond", xpRequired: 2000 },
    { name: "Ramen Warrior", icon: "restaurant", xpRequired: 150 },
    { name: "Streak Lord", icon: "local_fire_department", xpRequired: 350 },
    { name: "Wealth Wizard", icon: "insights", xpRequired: 750 },
  ];

  const dbBadges = [];
  for (const b of badges) {
    dbBadges.push(await prisma.badge.create({ data: b }));
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Demo hero: level 14 = 6500–6999 XP
  const demoUser = await prisma.user.create({
    data: {
      email: "hero@fingame.com",
      name: "Alex M.",
      password: hashedPassword,
      level: 14,
      xp: 6750,
      streak: 12,
      tourCompleted: true,
    },
  });

  const competitors = [
    { email: "sarah@fingame.com", name: "Sarah J.", level: 42, xp: 20800, streak: 15 },
    { email: "mike@fingame.com", name: "Mike T.", level: 28, xp: 14200, streak: 8 },
    { email: "elena@fingame.com", name: "Elena R.", level: 20, xp: 10100, streak: 5 },
  ];

  for (const c of competitors) {
    await prisma.user.create({
      data: { ...c, password: hashedPassword },
    });
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const sampleExpenses = [
    { userId: demoUser.id, amount: 18.4, category: "🍔 Food", note: "Burger Quest", date: today, xpAwarded: 5 },
    { userId: demoUser.id, amount: 5.5, category: "☕ Coffee", note: "Mana Potion", date: yesterday, xpAwarded: 2 },
    { userId: demoUser.id, amount: 24.0, category: "🚗 Transport", note: "Fast Travel", date: fourDaysAgo, xpAwarded: 8 },
    { userId: demoUser.id, amount: 12.0, category: "🎮 Gaming", note: "Side Quest", date: twoDaysAgo, xpAwarded: 4 },
  ];

  for (const exp of sampleExpenses) {
    await prisma.expense.create({ data: exp });
  }

  for (const quest of dbQuests) {
    if (quest.name === "Vault Builder") {
      await prisma.userQuest.create({
        data: { userId: demoUser.id, questId: quest.id, progress: 325, completed: false },
      });
    } else if (quest.name === "Home Chef Streak") {
      await prisma.userQuest.create({
        data: { userId: demoUser.id, questId: quest.id, progress: 2, completed: false },
      });
    } else if (quest.name === "First Save") {
      await prisma.userQuest.create({
        data: { userId: demoUser.id, questId: quest.id, progress: 1, completed: true },
      });
    } else {
      await prisma.userQuest.create({
        data: { userId: demoUser.id, questId: quest.id, progress: 0, completed: false },
      });
    }
  }

  for (const quest of dbQuests) {
    const competitorUsers = await prisma.user.findMany({
      where: { email: { in: competitors.map((c) => c.email) } },
    });
    for (const u of competitorUsers) {
      const exists = await prisma.userQuest.findFirst({
        where: { userId: u.id, questId: quest.id },
      });
      if (!exists) {
        await prisma.userQuest.create({
          data: { userId: u.id, questId: quest.id, progress: 0, completed: false },
        });
      }
    }
  }

  const firstSaveBadge = dbBadges.find((b) => b.name === "First Save");
  if (firstSaveBadge) {
    await prisma.userBadge.create({ data: { userId: demoUser.id, badgeId: firstSaveBadge.id } });
  }

  const budgetKingBadge = dbBadges.find((b) => b.name === "Budget King");
  if (budgetKingBadge) {
    await prisma.userBadge.create({ data: { userId: demoUser.id, badgeId: budgetKingBadge.id } });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
