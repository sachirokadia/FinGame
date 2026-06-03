import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expenses.js";
import questRoutes from "./routes/quests.js";
import badgeRoutes from "./routes/badges.js";
import statsRoutes from "./routes/stats.js";
import { prisma } from "./lib/prisma.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5000", "http://localhost:5005", "https://fingame-front.onrender.com"],
  credentials: true
}));

// Request parser middleware
app.use(express.json());

// Main sub-route linkages
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/stats", statsRoutes);

// Health check status endpoint
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "local-sqlite",
      timestamp: new Date(),
    });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "local-sqlite" });
  }
});

// Serve a static welcome message on the root
app.get("/", (req, res) => {
  res.send("FinGame RPG expense tracker API is running! 🚀");
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "An unexpected error occurred on the server" });
});

app.listen(PORT, () => {
  console.log(`[FinGame Server] Server is running in dark mode at http://localhost:${PORT} ⚔️`);
});
