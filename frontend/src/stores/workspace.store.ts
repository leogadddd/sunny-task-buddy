import { create } from "zustand";
import {
  workspaceApi,
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from "@/api/workspace.api";
import { toast } from "sonner";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (input: CreateWorkspaceInput) => Promise<Workspace>;
  updateWorkspace: (id: string, input: UpdateWorkspaceInput) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  getWorkspaceBySlug: (slug: string) => Promise<Workspace | null>;
  clearError: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspaces = await workspaceApi.getWorkspaces();
      set({ workspaces, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch workspaces";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  createWorkspace: async (input: CreateWorkspaceInput) => {
    set({ isLoading: true, error: null });
    try {
      const newWorkspace = await workspaceApi.createWorkspace(input);

      // Optimistic update
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        isLoading: false,
      }));

      toast.success(`Workspace "${input.name}" created successfully!`);
      return newWorkspace;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      throw error; // Re-throw to allow components to handle it
    }
  },

  updateWorkspace: async (id: string, input: UpdateWorkspaceInput) => {
    const workspaceName =
      get().workspaces.find((ws) => ws.id === id)?.name || "Workspace";
    set({ isLoading: true, error: null });
    try {
      const updatedWorkspace = await workspaceApi.updateWorkspace(id, input);

      // Optimistic update
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === id ? { ...ws, ...updatedWorkspace } : ws
        ),
        currentWorkspace:
          state.currentWorkspace?.id === id
            ? { ...state.currentWorkspace, ...updatedWorkspace }
            : state.currentWorkspace,
        isLoading: false,
      }));

      toast.success(`"${workspaceName}" updated successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteWorkspace: async (id: string) => {
    const state = get();
    const workspaceName =
      state.workspaces.find((ws) => ws.id === id)?.name || "Workspace";
    const isCurrentWorkspace = state.currentWorkspace?.id === id;

    set({ isLoading: true, error: null });
    try {
      await workspaceApi.deleteWorkspace(id);

      // Find the index of the deleted workspace
      const deletedIndex = state.workspaces.findIndex((ws) => ws.id === id);
      const remainingWorkspaces = state.workspaces.filter((ws) => ws.id !== id);

      // Determine the new current workspace if the deleted one was selected
      let newCurrentWorkspace = state.currentWorkspace;
      if (isCurrentWorkspace && remainingWorkspaces.length > 0) {
        // If deleted workspace was the current one, select the previous one
        // If it was the first item (index 0), select the new first item
        const newIndex = deletedIndex > 0 ? deletedIndex - 1 : 0;
        newCurrentWorkspace = remainingWorkspaces[newIndex] || null;
      } else if (isCurrentWorkspace) {
        // No workspaces left
        newCurrentWorkspace = null;
      }

      // Optimistic update
      set({
        workspaces: remainingWorkspaces,
        currentWorkspace: newCurrentWorkspace,
        isLoading: false,
      });

      toast.success(`"${workspaceName}" deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  setCurrentWorkspace: (workspace: Workspace | null) => {
    set({ currentWorkspace: workspace });
  },

  getWorkspaceBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const workspace = await workspaceApi.getWorkspaceBySlug(slug);
      set({ currentWorkspace: workspace, isLoading: false });
      return workspace;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
