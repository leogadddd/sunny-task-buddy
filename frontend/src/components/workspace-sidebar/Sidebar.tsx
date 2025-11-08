import React, { useEffect, useState } from "react";
import { Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceDialog } from "../dialogs/WorkspaceDialog";
import { WorkspaceItem } from "./WorkspaceItem";
import { useNavigate, useResolvedPath, useLocation } from "react-router-dom";

interface SidebarProps {
  onToggleWorkspaceSidebar: () => void;
}

export function Sidebar({ onToggleWorkspaceSidebar }: SidebarProps) {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    fetchWorkspaces,
    deleteWorkspace,
  } = useWorkspaceStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath("");
  const location = useLocation();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Navigate to the new current workspace after deletion
  useEffect(() => {
    if (currentWorkspace && location.pathname !== "/dashboard") {
      const expectedPath = `/${currentWorkspace.slug}`;
      // Allow project routes under the workspace
      const isOnWorkspaceRoute = location.pathname.startsWith(expectedPath);
      if (!isOnWorkspaceRoute) {
        navigate(expectedPath);
      }
    } else if (
      (workspaces.length === 0 &&
        !currentWorkspace &&
        !location.pathname.startsWith("/")) ||
      location.pathname === "/dashboard"
    ) {
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard");
      }
    }
  }, [currentWorkspace, location.pathname, navigate, workspaces.length]);

  // Clear currentWorkspace when navigating away from workspace routes
  useEffect(() => {
    const nonWorkspaceRoutes = ["/", "/auth", "/dashboard"];
    if (
      nonWorkspaceRoutes.includes(location.pathname) ||
      location.pathname.startsWith("/auth")
    ) {
      setCurrentWorkspace(null);
    }
  }, [location.pathname, setCurrentWorkspace]);

  return (
    <div className="w-16 bg-background flex flex-col items-center pb-4 pt-2 space-y-2 border-r">
      {/* Dashboard Button */}
      <Button
        variant="ghost"
        size="sm"
        // get the current pathname to highlight if on dashboard
        className={`w-12 h-12 rounded-2xl bg-card text-primary border transition-transform p-0 ${
          resolvedPath.pathname === "/dashboard" ? "scale-105" : ""
        }`}
        onClick={() => navigate("/dashboard")}
        title="Dashboard"
      >
        <Home size={32} />
      </Button>

      {/* Workspace Icons */}
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          isCurrent={currentWorkspace?.id === workspace.id}
          onSelect={setCurrentWorkspace}
          onDelete={deleteWorkspace}
          onToggleSidebar={onToggleWorkspaceSidebar}
        />
      ))}

      {/* Add Workspace Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 rounded-2xl bg-card border p-0"
        onClick={() => setIsCreateDialogOpen(true)}
        title="Add Workspace"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <WorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        workspace={null}
      />
    </div>
  );
}
