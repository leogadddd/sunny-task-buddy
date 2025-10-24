import { create } from "zustand";
import { projectApi } from "@/api/project.api";
import { toast } from "sonner";
import {
  CreateProjectInput,
  UpdateProjectInput,
  Project,
} from "@/interfaces/project";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.getProjects(workspaceId);
      set({ projects, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch projects";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  createProject: async (input: CreateProjectInput) => {
    set({ isLoading: true, error: null });
    try {
      const createPromise = projectApi.createProject(input);

      toast.promise(createPromise, {
        loading: "Creating project...",
        success: (newProject: Project) =>
          `"${newProject.name}" created successfully`,
        error: "Failed to create project",
      });

      const newProject = await createPromise;

      // Optimistic update - add new project to the front of the list
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));

      return newProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error; // Re-throw to allow components to handle it
    }
  },

  updateProject: async (id: string, input: UpdateProjectInput) => {
    const projectName =
      get().projects.find((p) => p.id === id)?.name || "Project";
    set({ isLoading: true, error: null });
    try {
      const updatePromise = projectApi.updateProject(id, input);

      toast.promise(updatePromise, {
        loading: "Updating project...",
        success: (updatedProject: Project) =>
          `"${updatedProject.name}" updated successfully`,
        error: "Failed to update project",
      });

      const updatedProject = await updatePromise;

      // Optimistic update
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        currentProject:
          state.currentProject?.id === id
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update project";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    const project = get().projects.find((p) => p.id === id);
    const projectName = project?.name || "Project";

    set({ isLoading: true, error: null });
    try {
      const deletePromise = projectApi.deleteProject(id);

      toast.promise(deletePromise, {
        loading: "Deleting project...",
        success: `"${projectName}" deleted successfully`,
        error: "Failed to delete project",
      });

      await deletePromise;

      // Optimistic update
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete project";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  clearError: () => {
    set({ error: null });
  },

  clearProjects: () => {
    set({ projects: [], currentProject: null });
  },
}));
