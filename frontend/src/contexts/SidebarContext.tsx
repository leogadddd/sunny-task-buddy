import React, { createContext, useContext, useState, ReactNode } from "react";

type SidebarTab = "home" | "tasks" | "projects" | "settings" | null;

type SettingsTab =
  | "account"
  | "appearance"
  | "behavior"
  | "notifications"
  | null;

interface SidebarContextType {
  activeTab: SidebarTab;
  activeSettingsTab: SettingsTab;
  setActiveTab: (tab: SidebarTab) => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  toggleTab: (tab: SidebarTab) => void;
  toggleSettingsTab: (tab: SettingsTab) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsTab>("account");

  const toggleTab = (tab: SidebarTab) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };

  const toggleSettingsTab = (tab: SettingsTab) => {
    if (activeSettingsTab === tab) {
      setActiveSettingsTab(null);
    } else {
      setActiveSettingsTab(tab);
    }
  };

  const value = {
    activeTab,
    activeSettingsTab,
    setActiveTab,
    setActiveSettingsTab,
    toggleTab,
    toggleSettingsTab,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
