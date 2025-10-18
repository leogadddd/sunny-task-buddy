import { apolloClient } from "@/lib/apollo/client";
import {
  MY_WORKSPACES_QUERY,
  WORKSPACE_BY_SLUG_QUERY,
  SEARCH_USERS_QUERY,
} from "@/lib/apollo/queries";
import {
  CREATE_WORKSPACE_MUTATION,
  UPDATE_WORKSPACE_MUTATION,
  DELETE_WORKSPACE_MUTATION,
  ADD_WORKSPACE_MEMBER_MUTATION,
  UPDATE_WORKSPACE_MEMBER_ROLE_MUTATION,
  REMOVE_WORKSPACE_MEMBER_MUTATION,
} from "@/lib/apollo/mutations";
import { Workspace } from "@/interfaces/workspace";
import { User } from "@/interfaces/users";

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  color?: string;
  status?: string;
}

export const workspaceApi = {
  async getWorkspaces(): Promise<Workspace[]> {
    const result = await apolloClient.query({
      query: MY_WORKSPACES_QUERY,
      fetchPolicy: "network-only", // Always fetch fresh data
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.myWorkspaces;

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch workspaces");
    }

    return response.data?.workspaces || [];
  },

  async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    const result = await apolloClient.query({
      query: WORKSPACE_BY_SLUG_QUERY,
      variables: { slug },
      fetchPolicy: "network-only",
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.workspaceBySlug;

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch workspace");
    }

    if (!response.data?.workspace) {
      throw new Error("Workspace not found");
    }

    return response.data.workspace;
  },

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const result = await apolloClient.mutate({
      mutation: CREATE_WORKSPACE_MUTATION,
      variables: {
        name: input.name,
        description: input.description,
        color: input.color,
      },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.createWorkspace;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] ||
        response.message ||
        "Failed to create workspace";
      throw new Error(errorMsg);
    }

    if (!response.data?.workspace) {
      throw new Error("Failed to create workspace");
    }

    return response.data.workspace;
  },

  async updateWorkspace(
    id: string,
    input: UpdateWorkspaceInput
  ): Promise<Workspace> {
    const result = await apolloClient.mutate({
      mutation: UPDATE_WORKSPACE_MUTATION,
      variables: {
        id,
        ...input,
      },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.updateWorkspace;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] ||
        response.message ||
        "Failed to update workspace";
      throw new Error(errorMsg);
    }

    if (!response.data?.workspace) {
      throw new Error("Failed to update workspace");
    }

    return response.data.workspace;
  },

  async deleteWorkspace(id: string): Promise<void> {
    const result = await apolloClient.mutate({
      mutation: DELETE_WORKSPACE_MUTATION,
      variables: { id },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.deleteWorkspace;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] ||
        response.message ||
        "Failed to delete workspace";
      throw new Error(errorMsg);
    }
  },

  async addMember(
    workspaceId: string,
    userId: string,
    role: "ADMIN" | "EDITOR" | "VIEWER" = "VIEWER"
  ): Promise<Workspace> {
    const result = await apolloClient.mutate({
      mutation: ADD_WORKSPACE_MEMBER_MUTATION,
      variables: {
        workspaceId,
        userId,
        role,
      },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.addWorkspaceMember;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] || response.message || "Failed to add member";
      throw new Error(errorMsg);
    }

    if (!response.data?.workspace) {
      throw new Error("Failed to add member");
    }

    return response.data.workspace;
  },

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: "ADMIN" | "EDITOR" | "VIEWER"
  ): Promise<Workspace> {
    const result = await apolloClient.mutate({
      mutation: UPDATE_WORKSPACE_MEMBER_ROLE_MUTATION,
      variables: {
        workspaceId,
        userId,
        role,
      },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.updateWorkspaceMemberRole;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] ||
        response.message ||
        "Failed to update member role";
      throw new Error(errorMsg);
    }

    if (!response.data?.workspace) {
      throw new Error("Failed to update member role");
    }

    return response.data.workspace;
  },

  async removeMember(workspaceId: string, userId: string): Promise<Workspace> {
    const result = await apolloClient.mutate({
      mutation: REMOVE_WORKSPACE_MEMBER_MUTATION,
      variables: {
        workspaceId,
        userId,
      },
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    const response = result.data.removeWorkspaceMember;

    if (!response.success) {
      const errorMsg =
        response.errors?.[0] || response.message || "Failed to remove member";
      throw new Error(errorMsg);
    }

    if (!response.data?.workspace) {
      throw new Error("Failed to remove member");
    }

    return response.data.workspace;
  },
};

export const userApi = {
  async searchUsers(
    query: string,
    workspaceId?: string,
    limit?: number
  ): Promise<User[]> {
    const result = await apolloClient.query({
      query: SEARCH_USERS_QUERY,
      variables: {
        query,
        workspaceId,
        limit: limit || 10,
      },
      fetchPolicy: "no-cache",
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data.searchUsers || [];
  },
};
