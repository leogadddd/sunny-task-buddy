import { DateTimeResolver } from "graphql-scalars";
import { Context } from "./context";
import { GraphQLError } from "graphql";

// Helper function to require authentication
const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
};

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        return null;
      }

      // Return user from database with full details
      return await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });
    },

    organizations: async (_parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },

    organization: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      // TODO: Implement with Prisma
      return null;
    },

    projects: async (
      _parent: any,
      args: { organizationId?: string },
      context: Context
    ) => {
      // TODO: Implement with Prisma
      return [];
    },

    project: async (_parent: any, args: { id: string }, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },

    tasks: async (
      _parent: any,
      args: { projectId?: string },
      context: Context
    ) => {
      // TODO: Implement with Prisma
      return [];
    },

    task: async (_parent: any, args: { id: string }, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
  },

  Mutation: {
    register: async (_parent: any, args: { input: any }, context: Context) => {
      // Authentication is handled by Better Auth via /api/auth/sign-up endpoint
      // This resolver is kept for backward compatibility but should not be used
      throw new GraphQLError(
        "Please use the Better Auth API endpoint for registration: /api/auth/sign-up",
        { extensions: { code: "DEPRECATED" } }
      );
    },

    login: async (_parent: any, args: { input: any }, context: Context) => {
      // Authentication is handled by Better Auth via /api/auth/sign-in endpoint
      // This resolver is kept for backward compatibility but should not be used
      throw new GraphQLError(
        "Please use the Better Auth API endpoint for login: /api/auth/sign-in",
        { extensions: { code: "DEPRECATED" } }
      );
    },

    createOrganization: async (
      _parent: any,
      args: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement organization creation with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    updateOrganization: async (
      _parent: any,
      args: { id: string; input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    deleteOrganization: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      return false;
    },

    createProject: async (
      _parent: any,
      args: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    updateProject: async (
      _parent: any,
      args: { id: string; input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    deleteProject: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      return false;
    },

    createTask: async (
      _parent: any,
      args: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    updateTask: async (
      _parent: any,
      args: { id: string; input: any },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      throw new Error("Not implemented yet - requires Prisma implementation");
    },

    deleteTask: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      // TODO: Implement with Prisma
      return false;
    },
  },

  // Relationship resolvers
  User: {
    organizations: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },
  },

  Organization: {
    createdBy: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
    projects: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },
    members: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },
  },

  Project: {
    organization: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
    tasks: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },
    assignees: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return [];
    },
  },

  Task: {
    project: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
    assignee: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
    createdBy: async (parent: any, _args: any, context: Context) => {
      // TODO: Implement with Prisma
      return null;
    },
  },
};
