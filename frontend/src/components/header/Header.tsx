import React from "react";
import { X, Minus, Square } from "lucide-react";
import { Logo } from "../Logo";
import { MenuPopover } from "./MenuPopover";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";

export function Header() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaceStore();
  const { currentProject } = useProjectStore();
  const isElectron =
    typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).process?.versions?.electron;

  return (
    <header className="flex items-center justify-between h-8 px-3 bg-background border-b border-border flex-shrink-0">
      <div className="flex-1">
        <Logo />
      </div>

      {/* Center: Workspace/Project Breadcrumb */}
      {currentWorkspace && (
        <div className="flex-1 flex justify-center items-center gap-2 text-sm">
          <span className="text-foreground font-medium">
            {currentWorkspace.name}
          </span>
          {currentProject && (
            <>
              <span className="text-muted-foreground">-</span>
              <span className="text-foreground">{currentProject.name}</span>
            </>
          )}
        </div>
      )}

      <div className="flex-1 flex gap-1 items-center justify-end">
        {user && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
        <MenuPopover />
        {isElectron && (
          <div className="flex items-center space-x-2">
            <button
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
              title="Minimize"
            >
              {/* <Minus className="w-2 h-2 text-yellow-900 mx-auto" /> */}
            </button>
            <button
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              title="Maximize"
            >
              {/* <Square className="w-2 h-2 text-green-900 mx-auto" /> */}
            </button>
            <button
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              title="Close"
            >
              {/* <X className="w-2 h-2 text-red-900 mx-auto" /> */}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
