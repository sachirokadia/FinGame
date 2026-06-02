import React from "react";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, className = "" }) => (
  <p className={`text-on-surface-variant text-center py-8 text-sm glass-card p-4 rounded-xl ${className}`}>
    {message}
  </p>
);
