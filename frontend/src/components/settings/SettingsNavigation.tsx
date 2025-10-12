import React from "react";
import { cn } from "@/lib/utils";
import { SettingsConfig } from "@/config/settings-config";

interface SettingsNavigationProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SettingsNavigation({
  categories,
  activeCategory,
  onCategoryChange,
}: SettingsNavigationProps) {
  return (
    <div className="w-48 border-r border-border bg-muted/30">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {String(category).charAt(0).toUpperCase() +
                String(category).slice(1)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
