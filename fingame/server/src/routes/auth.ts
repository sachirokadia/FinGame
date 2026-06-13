import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fingame_super_secret_key_12345";

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password)
    return res.status(400).json({ error: "Missing required fields: email, name, password" });

  // Basic validations
  if (typeof email !== "string" || !email.includes("@"))
    return res.status(400).json({ error: "Invalid email address" });
  if (typeof password !== "string" || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password:      hashedPassword,
        level:         1,
        xp:            0,
        streak:        0,
        monthlyBudget: 10000, // default budget for new users
      },
    });

    // Assign all default quests to the new user
    const defaultQuests = await prisma.quest.findMany({});
    for (const quest of defaultQuests) {
      await prisma.userQuest.create({
        data: { userId: newUser.id, questId: quest.id, progress: 0, completed: false },
      });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, level: newUser.level, xp: newUser.xp, streak: newUser.streak, monthlyBudget: newUser.monthlyBudget },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Something went wrong during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing required fields: email, password" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, level: user.level, xp: user.xp, streak: user.streak, monthlyBudget: user.monthlyBudget },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Something went wrong during login" });
  }
});

export default router;
