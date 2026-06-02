import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick }) => (
  <div
    className={`glass-card p-card-padding rounded-xl ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    onClick={onClick}
    role={onClick ? "button" : undefined}
  >
    {children}
  </div>
);
