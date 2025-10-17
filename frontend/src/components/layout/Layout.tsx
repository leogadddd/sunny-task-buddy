import React from "react";
import { Header } from "../header/Header";
import { Sidebar } from "../workspace-sidebar/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 h-[calc(100vh-2rem)] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
