import { Project } from "@/interfaces/project";
import { User } from "@/interfaces/users";
import { useAuth } from "@/hooks/useAuth";
import { CornerDownRight, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type roles = "ADMIN" | "EDITOR" | "VIEWER";

interface ProjectContextMenuItemProps {
  name: string;
  role: roles[];
  Icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}

const ProjectContextMenuItem = ({
  name,
  Icon,
  className,
  onClick,
}: ProjectContextMenuItemProps) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
    >
      {Icon}
      <span>{name}</span>
    </DropdownMenuItem>
  );
};

export default function ProjectContextMenu({
  project,
  onAction,
}: {
  project: Project;
  onAction?: () => void;
}) {
  const { user } = useAuth();

  // Get user's role from project members; if user is creator, treat as ADMIN
  let userRole = project.members?.find(
    (member) => member.user.id === user?.id
  )?.role as roles | undefined;
  if (!userRole && user?.id === project.createdBy.id) {
    userRole = "ADMIN";
  }

  const menu: ProjectContextMenuItemProps[] = [
    {
      name: "Open Project",
      role: ["ADMIN", "EDITOR", "VIEWER"],
      Icon: <CornerDownRight className="w-4 h-4" />,
      onClick: () => {
        // TODO: Navigate to project details
        console.log(`Opening project: ${project.name}`);
        onAction?.();
      },
    },
    {
      name: "Add Todo",
      role: ["ADMIN", "EDITOR"],
      Icon: <Plus className="w-4 h-4" />,
      onClick: () => {
        // TODO: Open add todo dialog
        console.log(`Adding todo to project: ${project.name}`);
        onAction?.();
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking menu
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {menu.map((item) => {
          // Show "Open Project" to any logged-in user; otherwise check role
          const isAllowed =
            item.name === "Open Project"
              ? !!user
              : userRole && item.role.includes(userRole);

          if (!isAllowed) return null;

          return (
            <ProjectContextMenuItem
              key={item.name}
              name={item.name}
              role={item.role}
              Icon={item.Icon}
              className={item.className}
              onClick={item.onClick}
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
