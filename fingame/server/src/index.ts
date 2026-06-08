import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expenses.js";
import questRoutes from "./routes/quests.js";
import badgeRoutes from "./routes/badges.js";
import statsRoutes from "./routes/stats.js";
import recurringRoutes from "./routes/recurring.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5000", "http://localhost:5005", "https://fingame-front.onrender.com"],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/recurring", recurringRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy", timestamp: new Date() });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

app.get("/", (_req, res) => {
  res.send("FinGame RPG expense tracker API is running! 🚀");
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "An unexpected error occurred on the server" });
});

app.listen(PORT, () => {
  console.log(`[FinGame Server] Running at http://localhost:${PORT} ⚔️`);
});
