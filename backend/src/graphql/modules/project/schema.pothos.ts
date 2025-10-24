import { builder } from "../../builder.js";
import { success, fail } from "../../utils/response.js";

/**
 * Pothos-based Workspace Types and Resolvers
 * Handles workspace CRUD operations with member management
 */

// Project type from Prisma model
const ProjectType = builder.prismaObject("Project", {
  description: "A project within a workspace",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    startDate: t.field({
      type: "String",
      nullable: true,
      resolve: (project) => project.startDate?.toISOString(),
    }),
    endDate: t.field({
      type: "String",
      nullable: true,
      resolve: (project) => project.endDate?.toISOString(),
    }),
    tags: t.exposeStringList("tags"),
    slug: t.exposeString("slug"),
    color: t.exposeString("color", { nullable: true }),
    createdAt: t.field({
      type: "String",
      resolve: (project) => project.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (project) => project.updatedAt.toISOString(),
    }),
    status: t.exposeString("status"),
    createdById: t.exposeString("createdById"),
    workspaceId: t.exposeString("workspaceId"),
    createdBy: t.relation("createdBy"),
    workspace: t.relation("workspace"),
    members: t.relation("members"),
    tasks: t.relation("tasks"),
  }),
});

// ProjectData type form response payload
const ProjectDataType = builder
  .objectRef<{ project: any }>("ProjectData")
  .implement({
    description: "Project data payload",
    fields: (t) => ({
      project: t.field({
        type: ProjectType,
        resolve: (data) => data.project,
      }),
    }),
  });

const ProjectListData = builder
  .objectRef<{ projects: any[] }>("ProjectListData")
  .implement({
    description: "Project list payload",
    fields: (t) => ({
      projects: t.field({
        type: [ProjectType],
        resolve: (data) => data.projects,
      }),
    }),
  });

const ProjectPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("ProjectPayload")
  .implement({
    description: "Project operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: ProjectDataType,
        nullable: true,
        resolve: (data) => data.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (data) => data.errors,
      }),
    }),
  });

const ProjectListPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("ProjectListPayload")
  .implement({
    description: "Project list operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: ProjectListData,
        nullable: true,
        resolve: (data) => data.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (data) => data.errors,
      }),
    }),
  });

// ==================== QUERIES ====================

// Get projects for a workspace
builder.queryField("projects", (t) =>
  t.field({
    type: ProjectListPayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        // Check if user is a member of the workspace
        const member = await ctx.prisma.workspaceMember.findFirst({
          where: {
            workspaceId: args.workspaceId,
            userId: ctx.user!.id,
          },
        });

        if (!member) {
          return fail("Access denied: You are not a member of this workspace");
        }

        const projects = await ctx.prisma.project.findMany({
          where: {
            workspaceId: args.workspaceId,
          },
          include: {
            createdBy: true,
            workspace: true,
            members: {
              include: {
                user: true,
              },
            },
            tasks: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return success("Projects fetched successfully", { projects });
      } catch (error: any) {
        return fail("Failed to fetch projects", [error.message]);
      }
    },
  })
);

// Get project by slug
builder.queryField("projectBySlug", (t) =>
  t.field({
    type: ProjectPayload,
    args: {
      workspaceSlug: t.arg.string({ required: true }),
      projectSlug: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        // First find the workspace
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { slug: args.workspaceSlug },
          include: {
            members: true,
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

        const project = await ctx.prisma.project.findUnique({
          where: { slug: args.projectSlug },
          include: {
            createdBy: true,
            workspace: true,
            members: {
              include: {
                user: true,
              },
            },
            tasks: true,
          },
        });

        if (!project || project.workspaceId !== workspace.id) {
          return fail("Project not found");
        }

        return success("Project fetched successfully", { project });
      } catch (error: any) {
        return fail("Failed to fetch project", [error.message]);
      }
    },
  })
);

// ==================== MUTATIONS ====================

// Create project
builder.mutationField("createProject", (t) =>
  t.field({
    type: ProjectPayload,
    args: {
      workspaceId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      startDate: t.arg.string({ required: false }),
      endDate: t.arg.string({ required: false }),
      tags: t.arg.stringList({ required: false }),
      color: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const {
          workspaceId,
          name,
          description,
          startDate,
          endDate,
          tags,
          color,
        } = args;

        // Check if workspace exists and user is a member
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            members: true,
          },
        });

        if (!workspace) {
          return fail("Workspace not found");
        }

        const isMember = workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Validate name
        if (!name || name.trim().length === 0) {
          return fail("Project name is required", ["VALIDATION_ERROR"]);
        }

        if (name.length > 100) {
          return fail("Project name must be less than 100 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        // Generate slug from name
        const baseSlug = name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let slug = baseSlug;
        let counter = 1;

        // Ensure slug is unique within workspace
        while (
          await ctx.prisma.project.findFirst({
            where: { slug, workspaceId },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Parse dates
        const parsedStartDate = startDate ? new Date(startDate) : undefined;
        const parsedEndDate = endDate ? new Date(endDate) : undefined;

        // Create project
        const project = await ctx.prisma.project.create({
          data: {
            name: name.trim(),
            slug,
            description: description?.trim(),
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            tags: tags || [],
            color: color || "#f1594a",
            workspaceId,
            createdById: ctx.user.id,
          },
          include: {
            createdBy: true,
            workspace: true,
            members: {
              include: {
                user: true,
              },
            },
            tasks: true,
          },
        });

        return success("Project created successfully", { project });
      } catch (error: any) {
        return fail("Failed to create project", [error.message]);
      }
    },
  })
);

// Update project
builder.mutationField("updateProject", (t) =>
  t.field({
    type: ProjectPayload,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      startDate: t.arg.string({ required: false }),
      endDate: t.arg.string({ required: false }),
      tags: t.arg.stringList({ required: false }),
      color: t.arg.string({ required: false }),
      status: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const {
          id,
          name,
          description,
          startDate,
          endDate,
          tags,
          color,
          status,
        } = args;

        // Check if project exists
        const existingProject = await ctx.prisma.project.findUnique({
          where: { id },
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        });

        if (!existingProject) {
          return fail("Project not found");
        }

        // Check if user is a member of the workspace
        const isMember = existingProject.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Build update data
        const updateData: any = {};
        if (name) {
          if (name.trim().length === 0) {
            return fail("Project name cannot be empty", ["VALIDATION_ERROR"]);
          }
          updateData.name = name.trim();

          // Regenerate slug if name changed
          const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

          let slug = baseSlug;
          let counter = 1;

          while (
            await ctx.prisma.project.findFirst({
              where: {
                slug,
                workspaceId: existingProject.workspaceId,
                id: { not: id },
              },
            })
          ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          updateData.slug = slug;
        }
        if (description !== undefined)
          updateData.description = description?.trim();
        if (startDate !== undefined)
          updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined)
          updateData.endDate = endDate ? new Date(endDate) : null;
        if (tags) updateData.tags = tags;
        if (color) updateData.color = color;
        if (
          status &&
          ["planning", "active", "completed", "archived"].includes(status)
        ) {
          updateData.status = status;
        }

        // Update project
        const project = await ctx.prisma.project.update({
          where: { id },
          data: updateData,
          include: {
            createdBy: true,
            workspace: true,
            members: {
              include: {
                user: true,
              },
            },
            tasks: true,
          },
        });

        return success("Project updated successfully", { project });
      } catch (error: any) {
        return fail("Failed to update project", [error.message]);
      }
    },
  })
);

// Delete project
builder.mutationField("deleteProject", (t) =>
  t.field({
    type: ProjectPayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id } = args;

        // Check if project exists
        const project = await ctx.prisma.project.findUnique({
          where: { id },
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        });

        if (!project) {
          return fail("Project not found");
        }

        // Check if user is a member of the workspace
        const isMember = project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Delete project (cascade will delete tasks)
        await ctx.prisma.project.delete({
          where: { id },
        });

        return success("Project deleted successfully");
      } catch (error: any) {
        return fail("Failed to delete project", [error.message]);
      }
    },
  })
);
