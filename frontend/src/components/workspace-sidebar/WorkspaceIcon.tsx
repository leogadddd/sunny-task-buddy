import React from "react";

interface WorkspaceIconProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WorkspaceIcon({
  name,
  color,
  size = "md",
  className = "",
}: WorkspaceIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-4xl",
  };

  return (
    <div
      className={`rounded-2xl flex items-center justify-center text-white font-semibold transition-colors ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
