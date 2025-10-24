import React from "react";
import { Header } from "../header/Header";
import { Sidebar } from "../workspace-sidebar/Sidebar";
import { useLoading } from "@/hooks/useLoading";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isLoading } = useLoading();

  return (
    <div className="h-screen flex flex-col relative">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 h-[calc(100vh-2rem)] overflow-auto">
          {children}
        </div>
      </div>

      {/* Centralized Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="text-sm font-medium text-white">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
