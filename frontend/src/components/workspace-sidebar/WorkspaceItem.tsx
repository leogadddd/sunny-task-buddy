import React, { useState } from "react";
import { WorkspaceIcon } from "./WorkspaceIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace } from "@/interfaces/workspace";
import { useNavigate } from "react-router-dom";
import { WorkspaceDialog } from "../dialogs/WorkspaceDialog";
import { useAuth } from "@/hooks/useAuth";
import WorkspaceContextMenu from "./WorkspaceIconContextMenu";

interface WorkspaceItemProps {
  workspace: Workspace;
  isCurrent: boolean;
  onSelect: (workspace: Workspace) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleSidebar?: () => void;
}

export function WorkspaceItem({
  workspace,
  isCurrent,
  onSelect,
  onDelete,
  onToggleSidebar,
}: WorkspaceItemProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRightClick, setIsRightClick] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRightClick(true);
    setIsPopoverOpen(true);
  };

  const handlePopoverOpenChange = (open: boolean) => {
    if (open && !isRightClick) return;
    setIsPopoverOpen(open);
    if (!open) setIsRightClick(false);
  };

  const handleClick = () => {
    if (isCurrent && onToggleSidebar) {
      onToggleSidebar();
    } else {
      navigate(`/${workspace.slug}`);
      onSelect(workspace);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(workspace.id);
      setIsPopoverOpen(false);
    } catch (error) {
      toast.error("Failed to delete workspace");
    }
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <button
            onClick={handleClick}
            onContextMenu={handleRightClick}
            className={`transition-all border ${
              isCurrent
                ? "ring-offset-2 ring-offset-gray-800 rounded-2xl"
                : "rounded-lg opacity-70 hover:opacity-80"
            }`}
            title={workspace.name}
          >
            <WorkspaceIcon
              size="md"
              name={workspace.name}
              color={workspace.color}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="min-w-48 ml-3">
          <div>
            <div className="flex gap-3 items-center p-2 py-3 border-b">
              <WorkspaceIcon
                size="sm"
                name={workspace.name}
                color={workspace.color}
              />
              <h3 className="font-semibold text-lg">{workspace.name}</h3>
            </div>
          </div>
          <WorkspaceContextMenu
            workspace={workspace}
            User={user}
            onAction={() => setIsPopoverOpen(false)}
            onEdit={() => setIsDialogOpen(true)}
          />
        </PopoverContent>
      </Popover>
      <WorkspaceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        workspace={workspace}
      />
    </>
  );
}
