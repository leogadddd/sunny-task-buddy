import React from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ListTodo,
  BarChart3,
  KanbanSquare,
  Calendar,
  Settings,
  FileText,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

interface ProjectSidebarProps {
  className?: string;
}

export function ProjectSidebar({ className }: ProjectSidebarProps) {
  const location = useLocation();
  const params = useParams();

  const basePath = `/${params.workspaceSlug}/${params.projectSlug}`;
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: "Overview",
      path: basePath,
      icon: LayoutDashboard,
    },
    {
      label: "Tasks",
      path: `${basePath}/tasks`,
      icon: ListTodo,
    },
    {
      label: "Kanban",
      path: `${basePath}/kanban`,
      icon: KanbanSquare,
    },
    {
      label: "Gantt Chart",
      path: `${basePath}/gantt`,
      icon: BarChart3,
    },
    {
      label: "Calendar",
      path: `${basePath}/calendar`,
      icon: Calendar,
    },
    {
      label: "Documents",
      path: `${basePath}/documents`,
      icon: FileText,
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
      <div className="p-2 pb-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-auto py-2 px-3 rounded-lg opacity-70"
          asChild
        >
          <Link to={`/${params.workspaceSlug}`} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-3" />
            Back to Workspace
          </Link>
        </Button>
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
