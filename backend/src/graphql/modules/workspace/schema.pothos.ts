import { builder } from "../../builder.js";
import { success, fail } from "../../utils/response.js";
import { getColorName } from "../../../lib/image-color.js";

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

// Enums for WorkspaceMember
const WorkspaceMemberRoleEnum = builder.enumType("WorkspaceMemberRole", {
  values: {
    ADMIN: {},
    EDITOR: {},
    VIEWER: {},
  },
});

const WorkspaceMemberStatusEnum = builder.enumType("WorkspaceMemberStatus", {
  values: {
    INVITED: {},
    ACTIVE: {},
  },
});

// WorkspaceMember type from Prisma model
const WorkspaceMemberType = builder.prismaObject("WorkspaceMember", {
  fields: (t) => ({
    id: t.exposeID("id"),
    role: t.field({
      type: WorkspaceMemberRoleEnum,
      resolve: (member) => member.role,
    }),
    status: t.field({
      type: WorkspaceMemberStatusEnum,
      resolve: (member) => member.status,
    }),
    createdAt: t.string({
      resolve: (member) => member.createdAt.toISOString(),
    }),
    updatedAt: t.string({
      resolve: (member) => member.updatedAt.toISOString(),
    }),
    // Relations
    user: t.relation("user"),
    workspace: t.relation("workspace"),
  }),
});

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
    projects: t.relation("projects"),
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
                userId: ctx.user.id,
              },
            },
          },
          include: {
            createdBy: true,
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
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
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Check if user is a member
        const isMember = workspace.members.some(
          (member) => member.userId === ctx.user!.id
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

        // Create workspace with creator as admin member
        const workspace = await ctx.prisma.workspace.create({
          data: {
            name: name.trim(),
            slug,
            description: description?.trim(),
            color: color || "#f1594a", // Default accent color
            createdById: ctx.user.id,
            members: {
              create: {
                userId: ctx.user.id,
                role: "ADMIN",
                status: "ACTIVE",
              },
            },
          },
          include: {
            createdBy: true,
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
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
          (member) => member.userId === ctx.user!.id
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
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
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

// ==================== MEMBER MANAGEMENT MUTATIONS ====================

// Add member to workspace
builder.mutationField("addWorkspaceMember", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      role: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { workspaceId, userId, role } = args;

        // Check if workspace exists
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            members: true,
            createdBy: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Check if current user is admin or creator
        const currentMember = workspace.members.find(
          (m) => m.userId === ctx.user!.id
        );
        if (!currentMember || currentMember.role !== "ADMIN") {
          return fail(
            "Access denied: Only admins can add members to this workspace"
          );
        }

        // Check if user exists
        const targetUser = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!targetUser) {
          return fail("User not found");
        }

        // Check if user is already a member
        const existingMember = workspace.members.find(
          (m) => m.userId === userId
        );
        if (existingMember) {
          return fail("User is already a member of this workspace");
        }

        // Add member with specified role or default to VIEWER
        const validRole = ["ADMIN", "EDITOR", "VIEWER"].includes(role || "")
          ? (role as "ADMIN" | "EDITOR" | "VIEWER")
          : ("VIEWER" as const);

        await ctx.prisma.workspaceMember.create({
          data: {
            userId,
            workspaceId,
            role: validRole,
            status: "INVITED",
          },
        });

        // Fetch updated workspace
        const updatedWorkspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            createdBy: true,
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
          },
        });

        return success("Member added successfully", {
          workspace: updatedWorkspace,
        });
      } catch (error: any) {
        return fail("Failed to add member", [error.message]);
      }
    },
  })
);

// Remove member from workspace
builder.mutationField("removeWorkspaceMember", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { workspaceId, userId } = args;

        // Check if workspace exists
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            members: true,
            createdBy: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Check if current user is admin or creator
        const currentMember = workspace.members.find(
          (m) => m.userId === ctx.user!.id
        );

        // Allow if: 1) Admin removing anyone (except creator), or 2) User removing themselves
        const isAdmin = currentMember && currentMember.role === "ADMIN";
        const isRemovingSelf = userId === ctx.user!.id;

        if (!isAdmin && !isRemovingSelf) {
          return fail(
            "Access denied: Only admins can remove other members from this workspace"
          );
        }

        // Can't remove the creator
        if (workspace.createdById === userId) {
          return fail("Cannot remove the workspace creator");
        }

        // Remove the member
        await ctx.prisma.workspaceMember.deleteMany({
          where: {
            userId,
            workspaceId,
          },
        });

        // Fetch updated workspace
        const updatedWorkspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            createdBy: true,
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
          },
        });

        return success("Member removed successfully", {
          workspace: updatedWorkspace,
        });
      } catch (error: any) {
        return fail("Failed to remove member", [error.message]);
      }
    },
  })
);

// Update member role
builder.mutationField("updateWorkspaceMemberRole", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { workspaceId, userId, role } = args;

        // Validate role
        if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
          return fail("Invalid role", ["VALIDATION_ERROR"]);
        }

        // Check if workspace exists
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            members: true,
            createdBy: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        // Check if current user is admin
        const currentMember = workspace.members.find(
          (m) => m.userId === ctx.user!.id
        );
        if (!currentMember || currentMember.role !== "ADMIN") {
          return fail("Access denied: Only admins can update member roles");
        }

        // Can't change the creator's role
        if (workspace.createdById === userId) {
          return fail("Cannot change the workspace creator's role");
        }

        // Update member role
        await ctx.prisma.workspaceMember.updateMany({
          where: {
            userId,
            workspaceId,
          },
          data: {
            role: role as "ADMIN" | "EDITOR" | "VIEWER",
          },
        });

        // Fetch updated workspace
        const updatedWorkspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            createdBy: true,
            members: {
              include: {
                user: true,
              },
            },
            projects: true,
          },
        });

        return success("Member role updated successfully", {
          workspace: updatedWorkspace,
        });
      } catch (error: any) {
        return fail("Failed to update member role", [error.message]);
      }
    },
  })
);

// Answer workspace invitation mutation
builder.mutationField("answerWorkspaceInvitation", (t) =>
  t.field({
    type: WorkspacePayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
      accept: t.arg.boolean({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      try {
        const { workspaceId, accept } = args;
        const userId = ctx.user?.id;

        if (!userId) {
          return fail("Authentication required");
        }

        // Find the workspace member record
        const member = await ctx.prisma.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId,
              workspaceId,
            },
          },
        });

        if (!member) {
          return fail("Invitation not found");
        }

        if (member.status !== "INVITED") {
          return fail("User is not invited to this workspace");
        }

        if (accept) {
          // Accept invitation: update status to ACTIVE
          await ctx.prisma.workspaceMember.update({
            where: {
              userId_workspaceId: {
                userId,
                workspaceId,
              },
            },
            data: {
              status: "ACTIVE",
            },
          });

          return success("Invitation accepted successfully");
        } else {
          // Decline invitation: delete the workspace member record
          await ctx.prisma.workspaceMember.delete({
            where: {
              userId_workspaceId: {
                userId,
                workspaceId,
              },
            },
          });

          return success("Invitation declined successfully");
        }
      } catch (error: any) {
        return fail("Failed to answer invitation", [error.message]);
      }
    },
  })
);
