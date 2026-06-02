import React from "react";

interface BadgeIconProps {
  name: string;
  icon: string;
  earned: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ name, icon, earned }) => (
  <div
    className={`flex flex-col items-center gap-2 group ${earned ? "" : "opacity-40"}`}
    title={earned ? `${name} — unlocked!` : `${name} — keep grinding to unlock`}
  >
    <div
      className={`w-16 h-16 rounded-full p-0.5 shadow-lg transition-transform ${
        earned
          ? "bg-gradient-to-br from-tertiary to-orange-600 group-hover:scale-110"
          : "bg-surface-container-highest"
      }`}
      style={earned ? {} : { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
    >
      <div
        className="w-full h-full flex items-center justify-center border border-white/20 bg-surface-container"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        <span
          className={`material-symbols-outlined text-3xl ${earned ? "text-tertiary" : "text-on-surface-variant"}`}
          style={{ fontVariationSettings: earned ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
      </div>
    </div>
    <span className={`text-[10px] text-center font-bold uppercase ${earned ? "text-on-surface" : "text-on-surface-variant"}`}>
      {name}
    </span>
  </div>
);
