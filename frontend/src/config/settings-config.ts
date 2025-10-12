export interface SettingItem {
  key: string;
  name: string;
  description: string;
  type: "text" | "number" | "boolean" | "select";
  defaultValue: any;
  options?: { label: string; value: any }[]; // For select type
}

export interface SettingsConfig {
  [category: string]: {
    name: string;
    description: string;
    items: SettingItem[];
  };
}

export const settingsConfig: SettingsConfig = {
  appearance: {
    name: "Appearance",
    description: "Customize the look and feel of the application",
    items: [
      {
        key: "animations",
        name: "Enable Animations",
        description: "Enable smooth animations for UI transitions",
        type: "boolean",
        defaultValue: false,
      },
      {
        key: "theme",
        name: "Theme",
        description: "Choose your preferred color theme",
        type: "select",
        defaultValue: "system",
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "System", value: "system" },
        ],
      },
    ],
  },
  behavior: {
    name: "Behavior",
    description: "Configure application behavior and interactions",
    items: [
      {
        key: "autoSave",
        name: "Auto Save",
        description: "Automatically save changes as you work",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "sidebarDefaultOpen",
        name: "Sidebar Default State",
        description: "Whether the sidebar should be open by default",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  notifications: {
    name: "Notifications",
    description: "Manage notification preferences",
    items: [
      {
        key: "taskReminders",
        name: "Task Reminders",
        description: "Receive reminders for upcoming tasks",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "soundEnabled",
        name: "Sound Notifications",
        description: "Play sounds for notifications",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },
};

export default settingsConfig;
