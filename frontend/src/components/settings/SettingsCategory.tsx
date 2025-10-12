import React from "react";
import { SettingInput } from "./SettingInput";
import { SettingsConfig, SettingItem } from "@/config/settings-config";

interface SettingsCategoryProps {
  category: keyof SettingsConfig;
  categoryData: SettingsConfig[keyof SettingsConfig];
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
}

export function SettingsCategory({
  category,
  categoryData,
  settings,
  onSettingChange,
}: SettingsCategoryProps) {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{categoryData.name}</h1>
        <p className="text-muted-foreground">{categoryData.description}</p>
      </div>

      <div className="space-y-6">
        {categoryData.items.map((setting: SettingItem) => (
          <div
            key={setting.key}
            className="p-4 border border-border rounded-lg bg-card"
          >
            <SettingInput
              setting={setting}
              value={settings[setting.key] ?? setting.defaultValue}
              onChange={(value) => onSettingChange(setting.key, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
