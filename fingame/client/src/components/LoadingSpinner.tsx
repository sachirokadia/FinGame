import React from "react";

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center py-12">
    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-secondary animate-spin" />
  </div>
);
