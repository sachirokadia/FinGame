import React from "react";

interface ApiErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  message = "Something went wrong loading data.",
  onRetry,
  className = "",
}) => (
  <div className={`glass-card p-6 rounded-xl text-center ${className}`}>
    <span className="material-symbols-outlined text-error text-3xl mb-2 block">cloud_off</span>
    <p className="text-on-surface-variant text-sm mb-4">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="btn-grad px-6 py-2 rounded-xl font-label-caps text-label-caps text-on-primary active:scale-95 transition-transform"
      >
        Try Again
      </button>
    )}
  </div>
);
