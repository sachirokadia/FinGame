import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { statsAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { DAY_LABELS, MONTH_NAMES } from "../utils/constants";
import { formatCurrency } from "../utils/format";

interface WeeklyStats {
  totalThisWeek: number;
  totalLastWeek: number;
  percentageChange: number;
  dailySpend: number[];
  topCategories: { name: string; amount: number; percentage: number }[];
}

interface MonthlyStats {
  monthlyBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  prevMonthTotal: number;
  monthOverMonthChange: number;
  daysInMonth: number;
  daysLeft: number;
  dailyAllowance: number;
  isOverBudget: boolean;
}

const categoryEmoji: Record<string, string> = {
  "🍔 Food": "🍔",
  "☕ Coffee": "☕",
  "🚗 Transport": "🚗",
  "🛍️ Shopping": "🛍️",
  "⚡ Utilities": "⚡",
  "🎮 Gaming": "🎮",
};

const StoryPage: React.FC = () => {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const now = new Date();
  const currentMonthName = MONTH_NAMES[now.getMonth()];

  const loadStats = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [weeklyRes, monthlyRes] = await Promise.all([
        statsAPI.getWeeklyStats(),
        statsAPI.getMonthlyStats(),
      ]);
      setWeeklyStats(weeklyRes.data);
      setMonthlyStats(monthlyRes.data);
    } catch {
      setError("Could not load stats. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleShare = async () => {
    if (!weeklyStats || !monthlyStats) return;
    const text = [
      `FinGame — ${currentMonthName} Report`,
      `Monthly Budget: ${formatCurrency(monthlyStats.monthlyBudget)}`,
      `Spent: ${formatCurrency(monthlyStats.totalSpent)} (${monthlyStats.percentUsed}%)`,
      `Remaining: ${formatCurrency(monthlyStats.remaining)}`,
      `This week: ${formatCurrency(weeklyStats.totalThisWeek)}`,
    ].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "FinGame Stats", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareFeedback("Copied to clipboard!");
    } catch {
      setShareFeedback("Could not share — try Download Story instead.");
    }
    setTimeout(() => setShareFeedback(null), 2500);
  };

  if (loading) return <LoadingSpinner />;

  if (error || !weeklyStats) {
    return (
      <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto">
        <ApiErrorState message={error ?? "No stats available."} onRetry={loadStats} />
      </main>
    );
  }

  const chartData = DAY_LABELS.map((day, i) => ({
    day,
    amount: weeklyStats.dailySpend[i] || 0,
  }));
  const peakIdx = chartData.reduce(
    (maxI, d, i, arr) => (d.amount > arr[maxI].amount ? i : maxI),
    0
  );
  // Daily budget line on the chart (from monthly stats if available)
  const dailyBudgetLine = monthlyStats
    ? monthlyStats.monthlyBudget / monthlyStats.daysInMonth
    : null;

  const badgeLabel =
    (user?.streak ?? 0) >= 7
      ? "Legendary Questing"
      : (user?.streak ?? 0) >= 3
        ? "Epic Adventurer"
        : "Rising Hero";

  return (
    <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          {currentMonthName} in Numbers
        </h1>
        <span className="px-3 py-1 rounded-full bg-tertiary/20 text-tertiary font-label-caps text-label-caps border border-tertiary/30">
          {badgeLabel}
        </span>
      </div>

      {/* ── Monthly Budget Summary ────────────────────────────────────────── */}
      {monthlyStats && (
        <GlassCard className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                {currentMonthName} Budget
              </p>
              <p className="font-display-lg text-3xl text-primary">
                {formatCurrency(monthlyStats.monthlyBudget)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Remaining</p>
              <p
                className={`font-display-lg text-3xl ${
                  monthlyStats.isOverBudget ? "text-error" : "text-secondary"
                }`}
              >
                {formatCurrency(monthlyStats.remaining)}
              </p>
            </div>
          </div>

          {/* Budget progress bar */}
          <ProgressBar value={Math.min(monthlyStats.percentUsed, 100)} max={100} />
          <div className="flex justify-between text-xs text-on-surface-variant mt-2">
            <span>{formatCurrency(monthlyStats.totalSpent)} spent</span>
            <span>{Math.round(monthlyStats.percentUsed)}% used</span>
            <span>{monthlyStats.daysLeft} days left</span>
          </div>

          {/* Month over month */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                compare_arrows
              </span>
              <span className="text-on-surface-variant">vs last month:</span>
              <span
                className={`font-semibold ${
                  monthlyStats.monthOverMonthChange > 0 ? "text-error" : "text-secondary"
                }`}
              >
                {monthlyStats.monthOverMonthChange > 0 ? "+" : ""}
                {monthlyStats.monthOverMonthChange}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">today</span>
              <span className="text-on-surface-variant">Daily allowance:</span>
              <span className="text-secondary font-semibold">
                {formatCurrency(monthlyStats.dailyAllowance)}/day
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── Weekly Total ────────────────────────────────────────────────── */}
      <GlassCard className="mb-6 text-center">
        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">
          This Week's Spend
        </p>
        <p className="font-display-lg text-4xl text-primary">
          {formatCurrency(weeklyStats.totalThisWeek)}
        </p>
        <p
          className={`text-sm mt-2 font-semibold ${
            weeklyStats.percentageChange > 0 ? "text-error" : "text-secondary"
          }`}
        >
          {weeklyStats.percentageChange > 0 ? "+" : ""}
          {weeklyStats.percentageChange}% vs Last Week
        </p>
      </GlassCard>

      {/* ── Spending Intensity Chart ─────────────────────────────────────── */}
      <GlassCard className="mb-6">
        <h2 className="font-title-md text-title-md text-on-surface mb-4">Spending Intensity</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: "#c7c4d7", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#171f33",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#dae2fd",
                }}
                formatter={(v: number) => [formatCurrency(v), "Spent"]}
              />
              {/* Daily budget reference line */}
              {dailyBudgetLine && (
                <ReferenceLine
                  y={dailyBudgetLine}
                  stroke="#4edea3"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: "Daily limit",
                    fill: "#4edea3",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              )}
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      index === peakIdx
                        ? "url(#peakGradient)"
                        : dailyBudgetLine && entry.amount > dailyBudgetLine
                          ? "url(#overGradient)"
                          : "url(#underGradient)"
                    }
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="underGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8083ff" />
                  <stop offset="100%" stopColor="#4edea3" />
                </linearGradient>
                <linearGradient id="overGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb95f" />
                  <stop offset="100%" stopColor="#ffb4ab" />
                </linearGradient>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ca8100" />
                  <stop offset="100%" stopColor="#ffb4ab" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {chartData[peakIdx] && (
          <p className="text-xs text-tertiary text-center mt-2">
            Peak day: {chartData[peakIdx].day} ({formatCurrency(chartData[peakIdx].amount)})
          </p>
        )}
      </GlassCard>

      {/* ── Top Categories ───────────────────────────────────────────────── */}
      <GlassCard className="mb-6">
        <h2 className="font-title-md text-title-md text-on-surface mb-4">Top Power-Ups</h2>
        <div className="space-y-4">
          {weeklyStats.topCategories.slice(0, 4).map((cat) => {
            const emoji = categoryEmoji[cat.name] || cat.name.slice(0, 2);
            const label = cat.name.replace(/^[\p{Emoji}\s]+/u, "").trim() || cat.name;
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    {emoji} {label}
                  </span>
                  <span className="text-on-surface-variant">{cat.percentage}%</span>
                </div>
                <ProgressBar value={cat.percentage} max={100} />
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ── Budget Boss achievement ──────────────────────────────────────── */}
      {(user?.streak ?? 0) >= 7 && (
        <GlassCard className="mb-6 glow-shadow-secondary border-secondary/30">
          <div className="flex items-center gap-4">
            <span
              className="material-symbols-outlined text-4xl text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
            <div>
              <p className="font-title-md text-secondary">Budget Boss</p>
              <p className="text-sm text-on-surface-variant">
                Under limit for 7 consecutive days! +500 XP GAINED
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {shareFeedback && (
        <p className="text-center text-secondary text-sm mb-3">{shareFeedback}</p>
      )}

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl font-label-caps text-label-caps border border-primary/30 text-primary hover:bg-primary/10 active:scale-95 transition-all"
        >
          Flex Your Stats
        </button>
        <button
          type="button"
          onClick={() => {
            if (!weeklyStats || !monthlyStats) return;
            const storyText = [
              `FinGame — ${currentMonthName} Story`,
              `Monthly Budget: ${formatCurrency(monthlyStats.monthlyBudget)}`,
              `Spent: ${formatCurrency(monthlyStats.totalSpent)} (${Math.round(monthlyStats.percentUsed)}%)`,
              `Remaining: ${formatCurrency(monthlyStats.remaining)}`,
              `Daily Allowance: ${formatCurrency(monthlyStats.dailyAllowance)}/day`,
              "",
              `This Week: ${formatCurrency(weeklyStats.totalThisWeek)} (${weeklyStats.percentageChange > 0 ? "+" : ""}${weeklyStats.percentageChange}% vs last week)`,
              "",
              "Top Power-Ups:",
              ...weeklyStats.topCategories.map((c) => `- ${c.name}: ${c.percentage}%`),
            ].join("\n");
            const blob = new Blob([storyText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `fingame-${currentMonthName.toLowerCase()}-story.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex-1 py-3 rounded-xl font-label-caps text-label-caps border border-white/10 text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all"
        >
          Download Story
        </button>
      </div>
    </main>
  );
};

export default StoryPage;
