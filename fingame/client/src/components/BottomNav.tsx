import React from "react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  onAddClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onAddClick }) => {
  const location = useLocation();
  const path = location.pathname;

  const getTabClass = (tabPath: string) => {
    const isActive = path === tabPath;
    return `flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
      isActive
        ? "text-secondary-fixed-dim drop-shadow-[0_0_8px_rgba(78,222,163,0.5)] font-bold scale-105"
        : "text-on-surface-variant/60 hover:text-secondary active:scale-90"
    }`;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-40 flex justify-around items-end pb-6 pt-2 px-4 bg-surface-container/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-2xl md:bottom-4 md:border">
      {/* Hub (Dashboard) */}
      <Link to="/dashboard" className={getTabClass("/dashboard")}>
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: path === "/dashboard" ? "'FILL' 1" : "'FILL' 0" }}>
          grid_view
        </span>
        <span className="font-label-caps text-[10px] mt-1">Hub</span>
      </Link>

      {/* Quests */}
      <Link id="tour-nav-quests" to="/quests" className={getTabClass("/quests")}>
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: path === "/quests" ? "'FILL' 1" : "'FILL' 0" }}>
          military_tech
        </span>
        <span className="font-label-caps text-[10px] mt-1">Quests</span>
      </Link>

      {/* Elevated Add Expense Pill */}
      <div className="relative -top-4">
        <button
          id="tour-add-expense"
          onClick={onAddClick}
          className="w-14 h-14 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-on-primary shadow-lg shadow-secondary/30 glow-indigo hover:scale-105 active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-[32px] font-bold">add</span>
        </button>
      </div>

      {/* Story */}
      <Link id="tour-nav-story" to="/story" className={getTabClass("/story")}>
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: path === "/story" ? "'FILL' 1" : "'FILL' 0" }}>
          auto_stories
        </span>
        <span className="font-label-caps text-[10px] mt-1">Story</span>
      </Link>

      {/* Stats */}
      <Link id="tour-nav-stats" to="/stats" className={getTabClass("/stats")}>
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: path === "/stats" ? "'FILL' 1" : "'FILL' 0" }}>
          leaderboard
        </span>
        <span className="font-label-caps text-[10px] mt-1">Stats</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
