import appConfig from "@/config/app.config";
import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className="flex items-center space-x-1">
      <div
        className={`select-none pt-1 flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground font-bold text-xs rounded ${className}`}
      >
        {appConfig.appLogoText}
      </div>
      <span className="text-xs text-muted-foreground mt-0.5 select-none font-bold">
        {appConfig.appName}
      </span>
    </div>
  );
}
