import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarNavProps {
  onAddClick: () => void;
}

const navItems = [
  { path: "/dashboard", icon: "grid_view", label: "Hub" },
  { path: "/quests", icon: "military_tech", label: "Quests" },
  { path: "/story", icon: "auto_stories", label: "Story" },
  { path: "/stats", icon: "leaderboard", label: "Stats" },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ onAddClick }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40 pt-24 pb-6 px-4 bg-surface-container-low/90 backdrop-blur-xl border-r border-white/10">
      <div className="mb-8 px-2">
        <p className="font-label-caps text-label-caps text-on-surface-variant">Adventurer</p>
        <p className="font-title-md text-on-surface truncate">{user?.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-xs font-bold">
            LVL {user?.level ?? 1}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-xs font-bold streak-pulse">
            🔥 {user?.streak ?? 0}
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-tour-id={
                item.path === "/quests"
                  ? "tour-nav-quests"
                  : item.path === "/story"
                    ? "tour-nav-story"
                    : item.path === "/stats"
                      ? "tour-nav-stats"
                      : undefined
              }
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
                active
                  ? "bg-primary/15 text-primary border border-primary/30 glow-indigo"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        data-tour-id="tour-add-expense"
        onClick={onAddClick}
        className="mt-auto flex items-center justify-center gap-2 w-full py-4 rounded-xl font-label-caps text-label-caps text-on-primary active:scale-[0.96] transition-all glow-teal btn-grad"
      >
        <span className="material-symbols-outlined">add</span>
        Log Deed
      </button>
    </aside>
  );
};

export default SidebarNav;
