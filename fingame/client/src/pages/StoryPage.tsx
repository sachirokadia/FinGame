import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { statsAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { DAY_LABELS, DAILY_BUDGET } from "../utils/constants";
import { formatCurrency } from "../utils/format";

interface WeeklyStats {
  totalThisWeek: number;
  totalLastWeek: number;
  percentageChange: number;
  dailySpend: number[];
  topCategories: { name: string; amount: number; percentage: number }[];
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
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await statsAPI.getWeeklyStats();
      setStats(res.data);
    } catch {
      setError("Could not load weekly stats. Is the server running?");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleShare = async () => {
    if (!stats) return;
    const text = `I spent ${formatCurrency(stats.totalThisWeek)} this week on FinGame!`;
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

  if (error || !stats) {
    return (
      <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto">
        <ApiErrorState message={error ?? "No stats available."} onRetry={loadStats} />
      </main>
    );
  }

  const chartData = DAY_LABELS.map((day, i) => ({
    day,
    amount: stats.dailySpend[i] || 0,
    overBudget: (stats.dailySpend[i] || 0) > DAILY_BUDGET,
  }));

  const peakIdx = chartData.reduce((maxI, d, i, arr) => (d.amount > arr[maxI].amount ? i : maxI), 0);
  const badgeLabel =
    (user?.streak ?? 0) >= 7 ? "Legendary Questing" : (user?.streak ?? 0) >= 3 ? "Epic Adventurer" : "Rising Hero";

  return (
    <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">Your Week in Numbers</h1>
        <span className="px-3 py-1 rounded-full bg-tertiary/20 text-tertiary font-label-caps text-label-caps border border-tertiary/30">
          {badgeLabel}
        </span>
      </div>

      <GlassCard className="mb-6 text-center">
        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Total Mana Spent</p>
        <p className="font-display-lg text-4xl text-primary">{formatCurrency(stats.totalThisWeek)}</p>
        <p
          className={`text-sm mt-2 font-semibold ${
            stats.percentageChange > 0 ? "text-error" : "text-secondary"
          }`}
        >
          {stats.percentageChange > 0 ? "+" : ""}
          {stats.percentageChange}% vs Last Week
        </p>
      </GlassCard>

      <GlassCard className="mb-6">
        <h2 className="font-title-md text-title-md text-on-surface mb-4">Spending Intensity</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
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
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      index === peakIdx
                        ? "url(#peakGradient)"
                        : entry.overBudget
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

      <GlassCard className="mb-6">
        <h2 className="font-title-md text-title-md text-on-surface mb-4">Top Power-Ups</h2>
        <div className="space-y-4">
          {stats.topCategories.slice(0, 4).map((cat) => {
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

      {(user?.streak ?? 0) >= 7 && (
        <GlassCard className="mb-6 glow-shadow-secondary border-secondary/30">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
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
            const storyText = [
              "FinGame — Your Week in Numbers",
              `Total Mana Spent: ${formatCurrency(stats.totalThisWeek)}`,
              `Change: ${stats.percentageChange}% vs last week`,
              "",
              "Top Power-Ups:",
              ...stats.topCategories.map((c) => `- ${c.name}: ${c.percentage}%`),
            ].join("\n");
            const blob = new Blob([storyText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "fingame-weekly-story.txt";
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
