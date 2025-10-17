import React from "react";
import { WorkspaceIcon } from "./WorkspaceIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace } from "@/api/workspace.api";
import { useNavigate } from "react-router-dom";

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
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isRightClick, setIsRightClick] = React.useState(false);

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
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={handleClick}
          onContextMenu={handleRightClick}
          className={`transition-all ${
            isCurrent
              ? "ring-offset-2 ring-offset-gray-800 rounded-2xl scale-100"
              : "hover:scale-100 hover:rounded-2xl rounded-lg opacity-70 scale-90"
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
      <PopoverContent side="right" align="start" className="w-48">
        <div className="space-y-2">
          <h4 className="font-medium">{workspace.name}</h4>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            Delete Workspace
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
