import { settingsConfig } from "./settings-config";

// Helper function to get setting from localStorage
const getStoredSetting = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(`settings.${key}`);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const appConfig = {
  appName: "Uptrack",
  version: "0.0.1",
  animation: {
    easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    enabled: getStoredSetting(
      "animations",
      settingsConfig.appearance.items.find((item) => item.key === "animations")
        ?.defaultValue || false
    ),
  },
  settings: settingsConfig,
};

export default appConfig;
