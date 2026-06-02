import React from "react";

interface XPChipProps {
  xp: number;
  className?: string;
}

export const XPChip: React.FC<XPChipProps> = ({ xp, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-bold border border-secondary/30 ${className}`}
  >
    +{xp} XP ⚡
  </span>
);
