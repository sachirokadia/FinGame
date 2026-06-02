import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { questsAPI, badgesAPI, statsAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { QuestCard } from "../components/QuestCard";
import { BadgeIcon } from "../components/BadgeIcon";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ApiErrorState } from "../components/ui/ApiErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import type { QuestData, BadgeData, LeaderboardPlayer } from "../types";

type TabId = "journey" | "quests" | "badges" | "friends";

interface Milestone {
  level: number;
  done?: boolean;
  current?: boolean;
  locked?: boolean;
  mystery?: boolean;
}

function JourneyMap({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="sticky top-28 flex flex-col items-center">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-6 uppercase tracking-widest">
        Journey
      </h3>
      <div className="relative flex flex-col items-center gap-12">
        <div className="absolute w-1 level-line h-full left-1/2 -translate-x-1/2 rounded-full opacity-30" />
        {milestones.map((m) => (
          <div
            key={m.level}
            className={`relative z-10 flex flex-col items-center gap-2 ${m.locked || m.mystery ? "opacity-40" : ""}`}
          >
            <div
              className={`flex items-center justify-center ${
                m.current
                  ? "w-16 h-16 rounded-2xl bg-primary text-on-primary rotate-45 glow-indigo"
                  : m.done
                    ? "w-12 h-12 rounded-full bg-secondary text-on-secondary"
                    : "w-12 h-12 rounded-full bg-surface-container-highest border border-white/20"
              }`}
            >
              <span
                className={`material-symbols-outlined ${m.current ? "-rotate-45 text-3xl" : ""}`}
                style={{ fontVariationSettings: m.done || m.current ? "'FILL' 1" : "'FILL' 0" }}
              >
                {m.done && !m.current ? "check_circle" : m.current ? "star" : m.mystery ? "redeem" : "lock"}
              </span>
            </div>
            {m.current && (
              <span className="text-[10px] font-bold uppercase text-primary mt-1 whitespace-nowrap">
                You are here
              </span>
            )}
            <span
              className={`text-[10px] font-bold uppercase ${m.current ? "text-primary" : m.done ? "text-secondary" : "text-on-surface-variant"}`}
            >
              {m.mystery ? "Mystery" : `Level ${m.level}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FriendsRanking({ leaderboard }: { leaderboard: LeaderboardPlayer[] }) {
  return (
    <>
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4">Friends Ranking</h2>
      {leaderboard.length === 0 ? (
        <EmptyState message="No leaderboard data yet. Log expenses to climb the ranks!" />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          {leaderboard.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${
                player.isCurrentUser ? "sunken-surface bg-primary/5" : "hover:bg-white/5"
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${idx === 0 ? "text-tertiary" : "text-on-surface-variant"}`}>
                  #{player.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary">
                  {player.isCurrentUser ? "YOU" : player.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold">{player.name}</span>
              </div>
              <span className="text-xs text-on-surface-variant">{player.xp.toLocaleString()} XP</span>
            </div>
          ))}
          <Link
            to="/stats"
            className="block w-full py-3 text-center text-[10px] font-bold uppercase text-primary border-t border-white/5 hover:bg-primary/5 transition-colors active:scale-95"
          >
            Compare Stats
          </Link>
        </div>
      )}
    </>
  );
}

const QuestsPage: React.FC = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("quests");

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [qRes, bRes, lbRes] = await Promise.all([
        questsAPI.getQuests(),
        badgesAPI.getBadges(),
        statsAPI.getLeaderboard(),
      ]);
      setQuests(qRes.data);
      setBadges(bRes.data);
      setLeaderboard(lbRes.data.slice(0, 5));
    } catch {
      setError("Could not load quests data. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeQuests = quests.filter((q) => !q.completed);
  const userLevel = user?.level ?? 1;

  const journeyMilestones = [
    { level: 10, done: userLevel >= 10 },
    { level: userLevel, current: true },
    { level: Math.min(userLevel + 1, 19), locked: true },
    { level: 20, mystery: true },
  ];

  if (loading) return <LoadingSpinner />;

  if (error && quests.length === 0 && badges.length === 0) {
    return (
      <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-7xl mx-auto">
        <ApiErrorState message={error} onRetry={loadData} />
      </main>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "journey", label: "Journey" },
    { id: "quests", label: "Quests" },
    { id: "badges", label: "Badges" },
    { id: "friends", label: "Friends" },
  ];

  const showSection = (tab: TabId) => activeTab === tab;

  return (
    <main className="pt-24 pb-36 lg:pb-8 px-container-margin max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="text-xs underline shrink-0">Retry</button>
        </div>
      )}

      <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-full font-label-caps text-label-caps transition-all active:scale-95 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant border border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className={`lg:col-span-2 ${showSection("journey") ? "" : "hidden"} lg:block`}>
          <JourneyMap milestones={journeyMilestones} />
        </aside>

        <div className={`lg:col-span-7 flex flex-col gap-8 ${showSection("quests") || showSection("badges") ? "" : "hidden"} lg:flex`}>
          <section className={showSection("quests") ? "" : "hidden lg:block"}>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Active Quests</h2>
              <span className="text-label-caps font-label-caps text-secondary">{activeQuests.length} Remaining</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">Quests progress automatically as you log expenses.</p>
            <div className="grid gap-4">
              {activeQuests.length > 0 ? (
                activeQuests.map((q) => <QuestCard key={q.id} data={q} />)
              ) : (
                <p className="text-on-surface-variant glass-card p-6 rounded-xl text-center">All quests complete! 🎉</p>
              )}
            </div>
          </section>

          <section className={showSection("badges") ? "" : "hidden lg:block"}>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4">Hall of Fame</h2>
            <div className="glass-card p-6 rounded-xl">
              {badges.length === 0 ? (
                <EmptyState message="No badges loaded yet." className="py-4" />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                  {badges.map((b) => (
                    <BadgeIcon key={b.id} name={b.name} icon={b.icon} earned={b.earned} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className={`lg:col-span-3 ${showSection("friends") ? "" : "hidden"} lg:block`}>
          <FriendsRanking leaderboard={leaderboard} />
        </aside>
      </div>
    </main>
  );
};

export default QuestsPage;
