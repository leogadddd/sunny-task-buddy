import React from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Folder,
  Users,
  Settings,
  BarChart3,
  Calendar,
  Archive,
} from "lucide-react";

interface WorkspaceSidebarProps {
  className?: string;
}

export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const location = useLocation();

  if (!currentWorkspace) {
    return null;
  }

  const basePath = `/${currentWorkspace.slug}`;
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: "Overview",
      path: basePath,
      icon: Home,
    },
    {
      label: "Projects",
      path: `${basePath}/projects`,
      icon: Folder,
    },
    {
      label: "Members",
      path: `${basePath}/members`,
      icon: Users,
    },
    {
      label: "Calendar",
      path: `${basePath}/calendar`,
      icon: Calendar,
    },
    {
      label: "Analytics",
      path: `${basePath}/analytics`,
      icon: BarChart3,
    },
    {
      label: "Archive",
      path: `${basePath}/archive`,
      icon: Archive,
    },
    {
      label: "Settings",
      path: `${basePath}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "w-60 bg-background border-r border-border flex flex-col",
        className
      )}
    >
      <div className="p-4 pb-0">
        <h2 className="font-semibold text-lg truncate">
          {currentWorkspace.name}
        </h2>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive(item.path) && "bg-accent"
              )}
              asChild
            >
              <Link to={item.path}>
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
