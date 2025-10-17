import { builder } from "../../builder.js";
import { success, fail } from "../../utils/response.js";

/**
 * Pothos-based Workspace Types and Resolvers
 * Handles workspace CRUD operations with member management
 */

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Workspace type from Prisma model
const WorkspaceType = builder.prismaObject("Workspace", {
  fields: (t) => ({
    id: t.exposeID("id"),
    slug: t.exposeString("slug"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    color: t.exposeString("color"),
    status: t.exposeString("status"),
    createdAt: t.string({
      resolve: (workspace) => workspace.createdAt.toISOString(),
    }),
    updatedAt: t.string({
      resolve: (workspace) => workspace.updatedAt.toISOString(),
    }),
    // Relations
    createdBy: t.relation("createdBy"),
    members: t.relation("members"),
    // TODO: Uncomment when Project schema is created
    // projects: t.relation("projects"),
  }),
});

// WorkspaceData type for response payload
const WorkspaceData = builder
  .objectRef<{
    workspace: any;
  }>("WorkspaceData")
  .implement({
    fields: (t) => ({
      workspace: t.field({
        type: WorkspaceType,
        nullable: true,
        resolve: (parent) => parent.workspace,
      }),
    }),
  });

// WorkspaceListData type for list responses
const WorkspaceListData = builder
  .objectRef<{
    workspaces: any[];
  }>("WorkspaceListData")
  .implement({
    fields: (t) => ({
      workspaces: t.field({
        type: [WorkspaceType],
        resolve: (parent) => parent.workspaces,
      }),
    }),
  });

// WorkspacePayload type for unified responses
const WorkspacePayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("WorkspacePayload")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: WorkspaceData,
        nullable: true,
        resolve: (parent) => parent.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (parent) => parent.errors,
      }),
    }),
  });

// WorkspaceListPayload type for list responses
const WorkspaceListPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("WorkspaceListPayload")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: WorkspaceListData,
        nullable: true,
        resolve: (parent) => parent.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (parent) => parent.errors,
      }),
    }),
  });

// ==================== QUERIES ====================

// Get workspaces for authenticated user
builder.queryField("myWorkspaces", (t) =>
  t.field({
    type: WorkspaceListPayload,
    resolve: async (_, __, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const workspaces = await ctx.prisma.workspace.findMany({
          where: {
            members: {
              some: {
                id: ctx.user.id,
              },
            },
          },
          include: {
            createdBy: true,
            members: true,
            // TODO: Add projects when Project schema is created
            // projects: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return success("Workspaces fetched successfully", { workspaces });
      } catch (error: any) {
        return fail("Failed to fetch workspaces", [error.message]);
      }
    },
  })
);

// Get workspace by slug
builder.queryField("workspaceBySlug", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const workspace = await ctx.prisma.workspace.findUnique({
          where: { slug: args.slug },
          include: {
            createdBy: true,
            members: true,
            // TODO: Add projects when Project schema is created
            // projects: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Check if user is a member
        const isMember = workspace.members.some(
          (member) => member.id === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        return success("Workspace fetched successfully", { workspace });
      } catch (error: any) {
        return fail("Failed to fetch workspace", [error.message]);
      }
    },
  })
);

// ==================== MUTATIONS ====================

// Create workspace
builder.mutationField("createWorkspace", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      color: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { name, description, color } = args;

        // Validate name
        if (!name || name.trim().length === 0) {
          return fail("Workspace name is required", ["VALIDATION_ERROR"]);
        }

        if (name.length > 50) {
          return fail("Workspace name must be less than 50 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        // Generate slug from name
        const baseSlug = generateSlug(name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure slug is unique
        while (await ctx.prisma.workspace.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Create workspace with creator as member
        const workspace = await ctx.prisma.workspace.create({
          data: {
            name: name.trim(),
            slug,
            description: description?.trim(),
            color: color || "#f1594a", // Default accent color
            createdById: ctx.user.id,
            members: {
              connect: { id: ctx.user.id }, // Add creator as member
            },
          },
          include: {
            createdBy: true,
            members: true,
            // TODO: Add projects when Project schema is created
            // projects: true,
          },
        });

        return success("Workspace created successfully", { workspace });
      } catch (error: any) {
        return fail("Failed to create workspace", [error.message]);
      }
    },
  })
);

// Update workspace
builder.mutationField("updateWorkspace", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      color: t.arg.string({ required: false }),
      status: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id, name, description, color, status } = args;

        // Check if workspace exists and user is a member
        const existingWorkspace = await ctx.prisma.workspace.findUnique({
          where: { id },
          include: {
            members: true,
            createdBy: true,
          },
        });

        if (!existingWorkspace) {
          return fail("Workspace not found");
        }

        const isMember = existingWorkspace.members.some(
          (member) => member.id === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Only creator can change certain fields
        const isCreator = existingWorkspace.createdById === ctx.user.id;
        if ((name || status) && !isCreator) {
          return fail(
            "Access denied: Only the workspace creator can update name or status"
          );
        }

        // Build update data
        const updateData: any = {};
        if (name) {
          if (name.trim().length === 0) {
            return fail("Workspace name cannot be empty", ["VALIDATION_ERROR"]);
          }
          updateData.name = name.trim();

          // Regenerate slug if name changed
          const baseSlug = generateSlug(name);
          let slug = baseSlug;
          let counter = 1;

          while (
            await ctx.prisma.workspace.findFirst({
              where: { slug, id: { not: id } },
            })
          ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          updateData.slug = slug;
        }
        if (description !== undefined)
          updateData.description = description?.trim();
        if (color) updateData.color = color;
        if (status && ["active", "archived"].includes(status)) {
          updateData.status = status;
        }

        // Update workspace
        const workspace = await ctx.prisma.workspace.update({
          where: { id },
          data: updateData,
          include: {
            createdBy: true,
            members: true,
            // TODO: Add projects when Project schema is created
            // projects: true,
          },
        });

        return success("Workspace updated successfully", { workspace });
      } catch (error: any) {
        return fail("Failed to update workspace", [error.message]);
      }
    },
  })
);

// Delete workspace
builder.mutationField("deleteWorkspace", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id } = args;

        // Check if workspace exists
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id },
          include: {
            createdBy: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Only creator can delete
        if (workspace.createdById !== ctx.user.id) {
          return fail(
            "Access denied: Only the workspace creator can delete it"
          );
        }

        // Delete workspace (cascade will delete projects and tasks)
        await ctx.prisma.workspace.delete({
          where: { id },
        });

        return success("Workspace deleted successfully");
      } catch (error: any) {
        return fail("Failed to delete workspace", [error.message]);
      }
    },
  })
);
