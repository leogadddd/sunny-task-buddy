import { builder } from "../../builder.js";
import { success, fail } from "../../utils/response.js";

/**
 * Pothos-based Task Types and Resolvers
 * Handles task CRUD operations within projects
 */

// Task type from Prisma model
const TaskType = builder.prismaObject("Task", {
  description: "A task within a project",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    customFields: t.field({
      type: "String",
      nullable: true,
      resolve: (task) =>
        task.customFields ? JSON.stringify(task.customFields) : null,
    }),
    createdAt: t.field({
      type: "String",
      resolve: (task) => task.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (task) => task.updatedAt.toISOString(),
    }),
    projectId: t.exposeString("projectId"),
    createdById: t.exposeString("createdById"),
    assigneeId: t.exposeString("assigneeId", { nullable: true }),
    // Relations
    project: t.relation("project"),
    createdBy: t.relation("createdBy"),
    assignee: t.relation("assignee", { nullable: true }),
  }),
});

// TaskData type for response payload
const TaskDataType = builder.objectRef<{ task: any }>("TaskData").implement({
  description: "Task data payload",
  fields: (t) => ({
    task: t.field({
      type: TaskType,
      resolve: (data) => data.task,
    }),
  }),
});

const TaskListData = builder
  .objectRef<{ tasks: any[] }>("TaskListData")
  .implement({
    description: "Task list payload",
    fields: (t) => ({
      tasks: t.field({
        type: [TaskType],
        resolve: (data) => data.tasks,
      }),
    }),
  });

const TaskPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("TaskPayload")
  .implement({
    description: "Task operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: TaskDataType,
        nullable: true,
        resolve: (data) => data.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (data) => data.errors,
      }),
    }),
  });

const TaskListPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("TaskListPayload")
  .implement({
    description: "Task list operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: TaskListData,
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

// Get tasks for a project
builder.queryField("tasks", (t) =>
  t.field({
    type: TaskListPayload,
    args: {
      projectId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        // Check if user has access to the project (via workspace membership)
        const project = await ctx.prisma.project.findUnique({
          where: { id: args.projectId },
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

        const isMember = project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        const tasks = await ctx.prisma.task.findMany({
          where: {
            projectId: args.projectId,
          },
          include: {
            createdBy: true,
            assignee: true,
            project: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return success("Tasks fetched successfully", { tasks });
      } catch (error: any) {
        return fail("Failed to fetch tasks", [error.message]);
      }
    },
  })
);

// Get task by ID
builder.queryField("task", (t) =>
  t.field({
    type: TaskPayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const task = await ctx.prisma.task.findUnique({
          where: { id: args.id },
          include: {
            createdBy: true,
            assignee: true,
            project: {
              include: {
                workspace: {
                  include: {
                    members: true,
                  },
                },
              },
            },
          },
        });

        if (!task) {
          return fail("Task not found");
        }

        // Check if user has access to the project
        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        return success("Task fetched successfully", { task });
      } catch (error: any) {
        return fail("Failed to fetch task", [error.message]);
      }
    },
  })
);

// ==================== MUTATIONS ====================

// Create task
builder.mutationField("createTask", (t) =>
  t.field({
    type: TaskPayload,
    args: {
      projectId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      customFields: t.arg.string({ required: false }),
      assigneeId: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { projectId, name, description, customFields, assigneeId } = args;

        // Check if project exists and user has access
        const project = await ctx.prisma.project.findUnique({
          where: { id: projectId },
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

        const isMember = project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Validate inputs
        if (!name || name.trim().length === 0) {
          return fail("Task name is required", ["VALIDATION_ERROR"]);
        }

        if (name.length > 200) {
          return fail("Task name must be less than 200 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        // If assignee is specified, check if they exist and are workspace members
        if (assigneeId) {
          const assignee = await ctx.prisma.user.findUnique({
            where: { id: assigneeId },
          });

          if (!assignee) {
            return fail("Assignee not found");
          }

          const isAssigneeMember = project.workspace.members.some(
            (member) => member.userId === assigneeId
          );

          if (!isAssigneeMember) {
            return fail("Assignee must be a member of the workspace");
          }
        }

        // Create task
        const task = await ctx.prisma.task.create({
          data: {
            name: name.trim(),
            description: description.trim(),
            customFields: customFields ? JSON.parse(customFields) : null,
            projectId,
            createdById: ctx.user.id,
            assigneeId,
          },
          include: {
            createdBy: true,
            assignee: true,
            project: true,
          },
        });

        return success("Task created successfully", { task });
      } catch (error: any) {
        return fail("Failed to create task", [error.message]);
      }
    },
  })
);

// Update task
builder.mutationField("updateTask", (t) =>
  t.field({
    type: TaskPayload,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      customFields: t.arg.string({ required: false }),
      assigneeId: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id, name, description, customFields, assigneeId } = args;

        // Check if task exists
        const existingTask = await ctx.prisma.task.findUnique({
          where: { id },
          include: {
            project: {
              include: {
                workspace: {
                  include: {
                    members: true,
                  },
                },
              },
            },
          },
        });

        if (!existingTask) {
          return fail("Task not found");
        }

        // Check if user has access to the project
        const isMember = existingTask.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) {
          if (!name || name.trim().length === 0) {
            return fail("Task name cannot be empty", ["VALIDATION_ERROR"]);
          }
          updateData.name = name.trim();
        }
        if (description !== undefined) {
          updateData.description = description ? description.trim() : "";
        }
        if (customFields !== undefined)
          updateData.customFields = customFields
            ? JSON.parse(customFields)
            : null;

        // Handle assignee update
        if (assigneeId !== undefined) {
          if (assigneeId) {
            // Check if new assignee exists and is a workspace member
            const assignee = await ctx.prisma.user.findUnique({
              where: { id: assigneeId },
            });

            if (!assignee) {
              return fail("Assignee not found");
            }

            const isAssigneeMember =
              existingTask.project.workspace.members.some(
                (member) => member.userId === assigneeId
              );

            if (!isAssigneeMember) {
              return fail("Assignee must be a member of the workspace");
            }
          }
          updateData.assigneeId = assigneeId || null;
        }

        // Update task
        const task = await ctx.prisma.task.update({
          where: { id },
          data: updateData,
          include: {
            createdBy: true,
            assignee: true,
            project: true,
          },
        });

        return success("Task updated successfully", { task });
      } catch (error: any) {
        return fail("Failed to update task", [error.message]);
      }
    },
  })
);

// Delete task
builder.mutationField("deleteTask", (t) =>
  t.field({
    type: TaskPayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id } = args;

        // Check if task exists
        const task = await ctx.prisma.task.findUnique({
          where: { id },
          include: {
            project: {
              include: {
                workspace: {
                  include: {
                    members: true,
                  },
                },
              },
            },
          },
        });

        if (!task) {
          return fail("Task not found");
        }

        // Check if user has access to the project
        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied: You are not a member of this workspace");
        }

        // Delete task
        await ctx.prisma.task.delete({
          where: { id },
        });

        return success("Task deleted successfully");
      } catch (error: any) {
        return fail("Failed to delete task", [error.message]);
      }
    },
  })
);
