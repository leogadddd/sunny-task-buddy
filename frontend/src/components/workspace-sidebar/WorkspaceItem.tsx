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

interface WorkspaceItemProps {
  workspace: Workspace;
  isCurrent: boolean;
  onSelect: (workspace: Workspace) => void;
  onDelete: (id: string) => Promise<void>;
}

export function WorkspaceItem({
  workspace,
  isCurrent,
  onSelect,
  onDelete,
}: WorkspaceItemProps) {
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
    navigate(`/w/${workspace.slug}`);
    onSelect(workspace);
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
                ? "ring-offset-2 ring-offset-gray-800 rounded-2xl scale-100"
                : "rounded-lg opacity-70"
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
        <PopoverContent
          side="right"
          align="start"
          className="min-w-48 ml-3 p-2"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3 pb-2">
              <WorkspaceIcon
                size="sm"
                name={workspace.name}
                color={workspace.color}
              />
              <div className="flex flex-col">
                <p className="font-medium">{workspace.name}</p>
                <span className="text-muted-foreground text-xs">
                  {workspace.members.length} member
                  {workspace.members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full rounded-lg mb-2"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setIsDialogOpen(true);
                }}
              >
                Edit Workspace
              </Button>
            </div>
            <div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full rounded-lg"
                onClick={handleDelete}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
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
