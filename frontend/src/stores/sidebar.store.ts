import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { create } from "zustand";

export type SidebarTab = string | null;

export type Sidebar = {
  id: string;
  title: string;
  icon: LucideIcon;
  tooltip?: string;
  navigateTo?: string;
  isOpen?: boolean;
  sidebarComponent: ReactNode;
};

interface SidebarState {
  sidebars: Sidebar[];
  activeTab: SidebarTab;
  activeSettingsTab: string | null;
  addSidebar: (sidebar: Sidebar) => void;
  removeSidebar: (id: string) => void;
  toggleSidebar: (id: string) => void;
  openSidebar: (id: string) => void;
  closeSidebar: (id: string) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setActiveSettingsTab: (tab: string | null) => void;
  toggleTab: (tab: string) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  sidebars: [],
  activeTab: null,
  activeSettingsTab: "account",
  addSidebar: (sidebar: Sidebar) => {
    set((state) => {
      const newSidebars = [...state.sidebars, sidebar];
      return {
        sidebars: newSidebars,
        activeTab: state.activeTab || sidebar.id,
      };
    });
  },
  removeSidebar: (id: string) => {
    set((state) => ({
      sidebars: state.sidebars.filter((s) => s.id !== id),
    }));
  },
  toggleSidebar: (id: string) => {
    set((state) => ({
      sidebars: state.sidebars.map((s) =>
        s.id === id ? { ...s, isOpen: !s.isOpen } : s
      ),
    }));
  },
  openSidebar: (id: string) => {
    set((state) => ({
      sidebars: state.sidebars.map((s) =>
        s.id === id ? { ...s, isOpen: true } : s
      ),
    }));
  },
  closeSidebar: (id: string) => {
    set((state) => ({
      sidebars: state.sidebars.map((s) =>
        s.id === id ? { ...s, isOpen: false } : s
      ),
    }));
  },
  setActiveTab: (tab: SidebarTab) => {
    set({ activeTab: tab });
  },
  setActiveSettingsTab: (tab: string | null) => {
    set({ activeSettingsTab: tab });
  },
  toggleTab: (tab: string) => {
    set((state) => ({
      activeTab: state.activeTab === tab ? null : (tab as SidebarTab),
    }));
  },
}));
