import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingItem } from "@/config/settings-config";

interface SettingInputProps {
  setting: SettingItem;
  value: any;
  onChange: (value: any) => void;
}

export function SettingInput({ setting, value, onChange }: SettingInputProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  switch (setting.type) {
    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{setting.name}</Label>
            <p className="text-xs text-muted-foreground">
              {setting.description}
            </p>
          </div>
          <Switch checked={value} onCheckedChange={handleChange} />
        </div>
      );

    case "text":
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{setting.name}</Label>
          <p className="text-xs text-muted-foreground">{setting.description}</p>
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.defaultValue}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{setting.name}</Label>
          <p className="text-xs text-muted-foreground">{setting.description}</p>
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={setting.defaultValue.toString()}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{setting.name}</Label>
          <p className="text-xs text-muted-foreground">{setting.description}</p>
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    default:
      return null;
  }
}
