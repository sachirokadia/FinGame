import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "streak";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = "",
  variant = "default",
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  if (variant === "streak") {
    const segments = Math.ceil(max);
    const filled = Math.floor(value);
    return (
      <div className={`flex gap-2 ${className}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full ${i < filled ? "bg-secondary progress-glow" : "bg-surface-container-lowest"}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden ${className}`}>
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full progress-sparkle progress-glow transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
