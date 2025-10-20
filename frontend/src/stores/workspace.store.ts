import { create } from "zustand";
import { workspaceApi } from "@/api/workspace.api";
import { toast } from "sonner";
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Workspace,
} from "@/interfaces/workspace";

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
  addMember: (
    workspaceId: string,
    userId: string,
    role?: "ADMIN" | "EDITOR" | "VIEWER"
  ) => Promise<void>;
  updateMemberRole: (
    workspaceId: string,
    userId: string,
    role: "ADMIN" | "EDITOR" | "VIEWER"
  ) => Promise<void>;
  removeMember: (
    workspaceId: string,
    userId: string,
    isRemovingSelf?: boolean
  ) => Promise<void>;
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
      const createPromise = workspaceApi.createWorkspace(input);

      toast.promise(createPromise, {
        loading: "Creating workspace...",
        success: (newWorkspace: Workspace) =>
          `"${newWorkspace.name}" created successfully`,
        error: "Failed to create workspace",
      });

      const newWorkspace = await createPromise;

      // Optimistic update
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        isLoading: false,
      }));

      return newWorkspace;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Don't show error toast here since toast.promise handles it
      throw error; // Re-throw to allow components to handle it
    }
  },

  updateWorkspace: async (id: string, input: UpdateWorkspaceInput) => {
    const workspaceName =
      get().workspaces.find((ws) => ws.id === id)?.name || "Workspace";
    set({ isLoading: true, error: null });
    try {
      const updatePromise = workspaceApi.updateWorkspace(id, input);

      toast.promise(updatePromise, {
        loading: "Updating workspace...",
        success: `"${workspaceName}" updated successfully`,
        error: "Failed to update workspace",
      });

      const updatedWorkspace = await updatePromise;

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Don't show error toast here since toast.promise handles it
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
      const deletePromise = workspaceApi.deleteWorkspace(id);

      toast.promise(deletePromise, {
        loading: "Deleting workspace...",
        success: `"${workspaceName}" deleted successfully`,
        error: "Failed to delete workspace",
      });

      await deletePromise;

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete workspace";
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Don't show error toast here since toast.promise handles it
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
      // toast.error(errorMessage);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  addMember: async (workspaceId: string, userId: string, role = "VIEWER") => {
    set({ isLoading: true, error: null });
    try {
      const addPromise = workspaceApi.addMember(
        workspaceId,
        userId,
        role as "ADMIN" | "EDITOR" | "VIEWER"
      );

      toast.promise(addPromise, {
        loading: "Adding member...",
        success: "Member added successfully",
        error: "Failed to add member",
      });

      const updatedWorkspace = await addPromise;

      // Update the current workspace and the workspaces list if it matches
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === workspaceId ? updatedWorkspace : ws
        ),
        currentWorkspace:
          state.currentWorkspace?.id === workspaceId
            ? updatedWorkspace
            : state.currentWorkspace,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add member";
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Don't show error toast here since toast.promise handles it
      throw error;
    }
  },

  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    role: "ADMIN" | "EDITOR" | "VIEWER"
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updateRolePromise = workspaceApi.updateMemberRole(
        workspaceId,
        userId,
        role
      );

      toast.promise(updateRolePromise, {
        loading: "Updating member role...",
        success: "Member role updated successfully",
        error: "Failed to update member role",
      });

      const updatedWorkspace = await updateRolePromise;

      // Update the current workspace and the workspaces list if it matches
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === workspaceId ? updatedWorkspace : ws
        ),
        currentWorkspace:
          state.currentWorkspace?.id === workspaceId
            ? updatedWorkspace
            : state.currentWorkspace,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member role";
      set({
        error: errorMessage,
        isLoading: false,
      });
      // Don't show error toast here since toast.promise handles it
      throw error;
    }
  },

  removeMember: async (
    workspaceId: string,
    userId: string,
    isRemovingSelf = false
  ) => {
    set({ isLoading: true, error: null });
    try {
      const removePromise = workspaceApi.removeMember(workspaceId, userId);

      toast.promise(removePromise, {
        loading: isRemovingSelf ? "Leaving workspace..." : "Removing member...",
        success: isRemovingSelf
          ? "You have left the workspace"
          : "Member removed successfully",
        error: isRemovingSelf
          ? "Failed to leave workspace"
          : "Failed to remove member",
      });

      const updatedWorkspace = await removePromise;

      console.log("Updated Workspace after removal:", updatedWorkspace);

      // Update the current workspace and the workspaces list if it matches
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === workspaceId ? updatedWorkspace : ws
        ),
        currentWorkspace:
          state.currentWorkspace?.id === workspaceId
            ? updatedWorkspace
            : state.currentWorkspace,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
}));
