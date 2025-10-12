import React from "react";
import { CollapsibleSidebar } from "../CollapsibleSidebar";
import { HomeSidebarContent } from "../sidebars/HomeSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <CollapsibleSidebar>
      <HomeSidebarContent />
      {children}
    </CollapsibleSidebar>
  );
}
