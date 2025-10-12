import { create } from "zustand";
import { settingsConfig, SettingsConfig } from "@/config/settings-config";

interface SettingsState {
  // Current settings values
  settings: Record<string, any>;

  // UI state
  activeCategory: string;

  // Actions
  setSetting: (key: string, value: any) => void;
  setActiveCategory: (category: string) => void;
  reset: () => void;
  initialize: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  activeCategory: "account",

  setSetting: (key: string, value: any) => {
    set((state) => {
      const newSettings = {
        ...state.settings,
        [key]: value,
      };
      // Persist to localStorage
      try {
        localStorage.setItem(`settings.${key}`, JSON.stringify(value));
      } catch (error) {
        console.warn("Failed to persist setting to localStorage:", error);
      }
      return { settings: newSettings };
    });
  },

  setActiveCategory: (category: string) => {
    set({ activeCategory: category });
  },

  reset: () => {
    set({
      settings: {},
      activeCategory: "account",
    });
  },

  initialize: () => {
    const initialSettings: Record<string, any> = {};
    Object.values(settingsConfig).forEach((category) => {
      category.items.forEach((item) => {
        // Try to load from localStorage first, fallback to default
        try {
          const stored = localStorage.getItem(`settings.${item.key}`);
          initialSettings[item.key] =
            stored !== null ? JSON.parse(stored) : item.defaultValue;
        } catch {
          initialSettings[item.key] = item.defaultValue;
        }
      });
    });
    set({ settings: initialSettings });
  },
}));
