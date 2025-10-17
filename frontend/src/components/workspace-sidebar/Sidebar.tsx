import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { CreateWorkspaceDialog } from "../dialogs/CreateWorkspaceDialog";
import { WorkspaceItem } from "./WorkspaceItem";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    fetchWorkspaces,
    deleteWorkspace,
  } = useWorkspaceStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Navigate to the new current workspace after deletion
  React.useEffect(() => {
    if (currentWorkspace) {
      navigate(`/w/${currentWorkspace.slug}`);
    } else if (workspaces.length === 0) {
      // No workspaces left, go to dashboard
      navigate("/dashboard");
    }
  }, [currentWorkspace?.id]); // Only trigger when current workspace ID changes

  return (
    <div className="w-16 bg-background flex flex-col items-center pb-4 pt-2 space-y-1 border-r">
      {/* Workspace Icons */}
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          isCurrent={currentWorkspace?.id === workspace.id}
          onSelect={setCurrentWorkspace}
          onDelete={deleteWorkspace}
        />
      ))}

      {/* Separator */}
      {workspaces.length > 0 && <div className="w-8 h-px bg-muted my-2" />}

      {/* Add Workspace Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary p-0"
        onClick={() => setIsCreateDialogOpen(true)}
        title="Add Workspace"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
