import React, { ReactNode } from "react";
import SidebarNav from "./SidebarNav";

interface AppLayoutProps {
  children: ReactNode;
  onAddClick: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, onAddClick }) => {
  return (
    <div className="lg:pl-64">
      <SidebarNav onAddClick={onAddClick} />
      {children}
    </div>
  );
};

export default AppLayout;
