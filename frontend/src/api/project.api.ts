import { apolloClient } from "@/lib/apollo/client";
import {
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "@/lib/apollo/mutations";
import { PROJECTS_QUERY } from "@/lib/apollo/queries";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/interfaces/project";

class ProjectApi {
  /**
   * Get all projects for a workspace
   */
  async getProjects(workspaceId: string): Promise<Project[]> {
    try {
      const { data } = await apolloClient.query({
        query: PROJECTS_QUERY,
        variables: { workspaceId },
        fetchPolicy: "cache-first",
      });

      if (!data?.projects?.success) {
        throw new Error(data?.projects?.message || "Failed to fetch projects");
      }

      return data.projects.data.projects || [];
    } catch (error: unknown) {
      console.error("Fetch projects error:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to fetch projects");
      }
      throw new Error("Failed to fetch projects");
    }
  }
  /**
   * Create a new project
   */
  async createProject(input: CreateProjectInput): Promise<Project> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PROJECT_MUTATION,
        variables: {
          workspaceId: input.workspaceId,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          tags: input.tags,
          color: input.color,
        },
      });

      if (!data?.createProject?.success) {
        throw new Error(
          data?.createProject?.message || "Failed to create project"
        );
      }

      return data.createProject.data.project;
    } catch (error) {
      console.error("Create project error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create project"
      );
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PROJECT_MUTATION,
        variables: {
          id,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          tags: input.tags,
          color: input.color,
          status: input.status,
        },
      });

      if (!data?.updateProject?.success) {
        throw new Error(
          data?.updateProject?.message || "Failed to update project"
        );
      }

      return data.updateProject.data.project;
    } catch (error) {
      console.error("Update project error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update project"
      );
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PROJECT_MUTATION,
        variables: { id },
      });

      if (!data?.deleteProject?.success) {
        throw new Error(
          data?.deleteProject?.message || "Failed to delete project"
        );
      }
    } catch (error) {
      console.error("Delete project error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete project"
      );
    }
  }
}

export const projectApi = new ProjectApi();
