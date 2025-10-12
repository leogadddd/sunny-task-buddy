import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import appConfig from "@/config/app-config";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/stores/sidebar.store";
import { SidebarLayout } from "./layout/SidebarLayout";

// Helper function to get animation setting from localStorage
const getAnimationEnabled = () => {
  try {
    const stored = localStorage.getItem("settings.animations");
    return stored !== null ? JSON.parse(stored) : appConfig.animation.enabled;
  } catch {
    return appConfig.animation.enabled;
  }
};

interface CollapsibleSidebarProps {
  children: React.ReactNode;
}

export function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {
  const { sidebars, activeTab, toggleTab } = useSidebarStore();
  const [previousTab, setPreviousTab] = useState(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(
    getAnimationEnabled()
  );
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = localStorage.getItem("sidebarWidth");
    return stored ? parseInt(stored) : 256;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setPreviousTab(activeTab);
    }
  }, [activeTab]);

  // Listen for animation setting changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "settings.animations") {
        setAnimationsEnabled(getAnimationEnabled());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleTabClick = (tab: string, navigateTo: string) => {
    toggleTab(tab);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const maxWidth = window.innerWidth * 0.8;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      setSidebarWidth(Math.max(200, Math.min(maxWidth, newWidth)));
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const renderTabContent = (tab) => {
    const content = sidebars.find((t) => t.id === tab)?.sidebarComponent;
    return content || null;
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon Sidebar */}
        <div className="flex flex-col w-12 bg-sidebar-background border-r border-sidebar-border">
          {/* Top Tabs */}
          <div className="flex-1">
            {sidebars.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.navigateTo)}
                  className={cn(
                    "relative flex items-center justify-center h-12 w-12 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground transition-colors",
                    activeTab === tab.id && "text-sidebar-accent-foreground"
                  )}
                  title={tab.title}
                >
                  {activeTab === tab.id && (
                    <div className="bg-primary absolute left-0 w-1 h-full rounded-full"></div>
                  )}
                  <Icon className="w-5 h-5 " />
                </button>
              );
            })}
          </div>

          {/* No separate settings button needed - it's in sidebarConfig.tabs */}
        </div>

        {/* Expandable Content Sidebar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={
            activeTab
              ? { width: sidebarWidth, opacity: 1 }
              : { width: 0, opacity: 0 }
          }
          transition={{
            duration: isResizing ? 0 : animationsEnabled ? 0.3 : 0,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="border-r border-border overflow-hidden relative"
        >
          <SidebarLayout>
            {renderTabContent(activeTab || previousTab)}
          </SidebarLayout>
          <div
            className="absolute right-0 top-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-border"
            onMouseDown={handleMouseDown}
          ></div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
