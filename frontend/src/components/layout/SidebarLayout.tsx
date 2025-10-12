import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: LayoutProps) {
  return <div className="flex min-w-[256px] bg-sidebar h-full">{children}</div>;
}
