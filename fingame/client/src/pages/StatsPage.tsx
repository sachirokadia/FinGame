import React, { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { statsAPI, expensesAPI, badgesAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/format";
import type { Expense, LeaderboardPlayer } from "../types";

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [lbRes, expRes, badgeRes] = await Promise.all([
        statsAPI.getLeaderboard(),
        expensesAPI.getExpenses(),
        badgesAPI.getBadges(),
      ]);
      setLeaderboard(lbRes.data);
      setBadgeCount(badgeRes.data.filter((b: { earned: boolean }) => b.earned).length);

      const expenses: Expense[] = expRes.data;
      const byMonth: Record<string, number> = {};
      expenses.forEach((e) => {
        const d = new Date(e.date);
        const key = d.toLocaleString("en-US", { month: "short" });
        byMonth[key] = (byMonth[key] || 0) + e.amount;
      });
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartMonths = months
        .filter((m) => byMonth[m])
        .map((m) => ({ month: m, amount: byMonth[m] }))
        .slice(-6);

      if (chartMonths.length > 0) {
        setMonthlyData(chartMonths);
      } else if (expenses.length > 0) {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        setMonthlyData([{ month: "All", amount: total }]);
      } else {
        setMonthlyData([]);
      }
    } catch {
      setError("Could not load stats. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingSpinner />;

  if (error && leaderboard.length === 0) {
    return (
      <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-5xl mx-auto">
        <ApiErrorState message={error} onRetry={loadData} />
      </main>
    );
  }

  const currentPlayer = leaderboard.find((p) => p.isCurrentUser);

  return (
    <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-5xl mx-auto">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Stats & Leaderboard</h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="text-xs underline shrink-0">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Level", value: user?.level ?? 1, icon: "star" },
          { label: "Total XP", value: (user?.xp ?? 0).toLocaleString(), icon: "bolt" },
          { label: "Streak", value: `${user?.streak ?? 0} 🔥`, icon: "local_fire_department" },
          { label: "Badges", value: badgeCount, icon: "workspace_premium" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="text-center py-4">
            <span className="material-symbols-outlined text-secondary text-2xl mb-1">{stat.icon}</span>
            <p className="font-display-lg text-2xl text-primary">{stat.value}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {monthlyData.length > 0 ? (
        <GlassCard className="mb-8">
          <h2 className="font-title-md text-title-md text-on-surface mb-4">Monthly Spending</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8083ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4edea3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#171f33",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(v: number) => [formatCurrency(v), "Spent"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#8083ff" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      ) : (
        <EmptyState message="No spending data yet — log expenses to see your monthly chart." className="mb-8" />
      )}

      <GlassCard className="overflow-hidden p-0">
        <div className="p-card-padding border-b border-white/10">
          <h2 className="font-title-md text-title-md text-primary">Global Leaderboard</h2>
        </div>
        {leaderboard.length === 0 ? (
          <EmptyState message="No players on the leaderboard yet." className="border-0 shadow-none" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-on-surface-variant font-label-caps text-label-caps border-b border-white/5">
                    <th className="text-left p-4">Rank</th>
                    <th className="text-left p-4">Player</th>
                    <th className="text-left p-4 hidden sm:table-cell">Level</th>
                    <th className="text-left p-4">XP</th>
                    <th className="text-left p-4 hidden sm:table-cell">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player) => (
                    <tr
                      key={player.id}
                      className={`border-b border-white/5 transition-colors ${
                        player.isCurrentUser ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="p-4 font-bold text-tertiary">#{player.rank}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary shrink-0">
                            {player.isCurrentUser ? "YOU" : player.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-on-surface">{player.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-on-surface-variant">LVL {player.level}</td>
                      <td className="p-4 text-on-surface-variant">{player.xp.toLocaleString()}</td>
                      <td className="p-4 hidden sm:table-cell text-tertiary">🔥 {player.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {currentPlayer && (
              <p className="p-4 text-center text-xs text-on-surface-variant border-t border-white/5">
                You&apos;re ranked #{currentPlayer.rank} — keep grinding!
              </p>
            )}
          </>
        )}
      </GlassCard>
    </main>
  );
};

export default StatsPage;
