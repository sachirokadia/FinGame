import React from "react";
import { useAuth } from "../context/AuthContext";

const XPToast: React.FC = () => {
  const { xpToast } = useAuth();

  if (!xpToast?.visible) return null;

  const { xp, message } = xpToast;
  const displayMessage = message ?? (xp ? `+${xp} XP` : "+XP");

  return (
    <div className="fixed top-4 inset-x-0 flex justify-center pointer-events-none z-50">
      <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg glow-teal border-secondary/30">
        <span className="material-symbols-outlined text-secondary">bolt</span>
        <span className="font-label-caps text-label-caps text-secondary font-bold">{displayMessage}</span>
      </div>
    </div>
  );
};

export default XPToast;
