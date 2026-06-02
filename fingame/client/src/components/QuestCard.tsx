import React from "react";
import { ProgressBar } from "./ui/ProgressBar";
import { formatCurrency } from "../utils/format";

export type QuestData = {
  id: string;
  progress: number;
  completed: boolean;
  quest: {
    id: string;
    name: string;
    description: string;
    xpReward: number;
    targetValue: number;
    type: string;
  };
};

const questIcons: Record<string, string> = {
  "Vault Builder": "💰",
  "Home Chef Streak": "🚫🍔",
  "Budget Boss": "🛡️",
  "Frugal Week": "📉",
  "First Save": "✨",
};

interface QuestCardProps {
  data: QuestData;
  compact?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({ data, compact = false }) => {
  const { quest, progress, completed } = data;
  const pct = Math.round((progress / quest.targetValue) * 100);
  const icon = questIcons[quest.name] ?? "⚔️";
  const isStreak = quest.type === "streak";

  if (compact) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-title-md text-title-md text-on-surface">{icon} {quest.name}</h4>
          <span className="text-secondary text-xs font-bold">+{quest.xpReward} XP</span>
        </div>
        <ProgressBar value={progress} max={quest.targetValue} variant={isStreak ? "streak" : "default"} />
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-2">
          {isStreak
            ? `${Math.floor(progress)} / ${quest.targetValue} Days`
            : `${formatCurrency(progress)} / ${formatCurrency(quest.targetValue)} saved`}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-card-padding rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center relative overflow-hidden active:scale-[0.98] transition-transform">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-3xl border border-white/10 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1 gap-2">
          <h4 className="font-title-md text-title-md text-on-surface">{quest.name}</h4>
          <span className="text-secondary text-sm font-bold shrink-0">+{quest.xpReward} XP</span>
        </div>
        <p className="text-on-surface-variant text-sm mb-4">{quest.description}</p>
        <ProgressBar value={progress} max={quest.targetValue} variant={isStreak ? "streak" : "default"} />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          <span>
            {isStreak
              ? `${Math.floor(progress)} / ${quest.targetValue} Days Complete`
              : `${formatCurrency(progress)} / ${formatCurrency(quest.targetValue)}`}
          </span>
          <span>{completed ? "Complete!" : pct >= 60 ? "Almost there!" : `${pct}%`}</span>
        </div>
      </div>
    </div>
  );
};
