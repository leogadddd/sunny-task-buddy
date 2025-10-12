import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div
      className={`select-none flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground font-bold text-xs rounded ${className}`}
    >
      U
    </div>
  );
}
