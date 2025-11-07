import { builder } from "../../builder.js";
import { success, fail } from "../../utils/response.js";
import {
  publishDropdownEvent,
  DropdownEventType,
  type DropdownEventPayload,
} from "../../../lib/pubsub.js";

/**
 * Pothos-based Dropdown Types and Resolvers
 * Handles dropdown field creation, option management, and selection
 * Designed for SaaS scale with proper indexes and real-time support
 */

// Dropdown option type
const TaskDropdownOptionType = builder.prismaObject("TaskDropdownOption", {
  description: "An option within a task dropdown field",
  fields: (t) => ({
    id: t.exposeID("id"),
    label: t.exposeString("label"),
    color: t.exposeString("color", { nullable: true }),
    order: t.exposeInt("order"),
    fieldId: t.exposeString("fieldId"),
    createdAt: t.field({
      type: "String",
      resolve: (opt) => opt.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (opt) => opt.updatedAt.toISOString(),
    }),
  }),
});

// Dropdown field type
const TaskDropdownFieldType = builder.prismaObject("TaskDropdownField", {
  description: "A dropdown field for task categorization",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    taskId: t.exposeString("taskId"),
    options: t.relation("options", {
      args: {
        orderBy: t.arg.string({ required: false }),
      },
      query: (args) => ({
        orderBy: args.orderBy === "label" ? { label: "asc" } : { order: "asc" },
      }),
    }),
    createdAt: t.field({
      type: "String",
      resolve: (field) => field.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (field) => field.updatedAt.toISOString(),
    }),
  }),
});

// Selected option type (junction table)
const TaskSelectedOptionType = builder.prismaObject("TaskSelectedOption", {
  description: "A selected option for a task",
  fields: (t) => ({
    id: t.exposeID("id"),
    taskId: t.exposeString("taskId"),
    optionId: t.exposeString("optionId"),
    option: t.relation("option"),
    createdAt: t.field({
      type: "String",
      resolve: (sel) => sel.createdAt.toISOString(),
    }),
  }),
});

// Response types
const DropdownFieldPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("DropdownFieldPayload")
  .implement({
    description: "Dropdown field operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: TaskDropdownFieldType,
        nullable: true,
        resolve: (data) => data.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (data) => data.errors,
      }),
    }),
  });

const DropdownOptionPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("DropdownOptionPayload")
  .implement({
    description: "Dropdown option operation payload",
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: TaskDropdownOptionType,
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

// Get dropdown fields for a task
builder.queryField("taskDropdownFields", (t) =>
  t.field({
    type: [TaskDropdownFieldType],
    args: {
      taskId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }

        // Verify user has access to this task
        const task = await ctx.prisma.task.findUnique({
          where: { id: args.taskId },
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
          throw new Error("Task not found");
        }

        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          throw new Error("Access denied");
        }

        const fields = await ctx.prisma.taskDropdownField.findMany({
          where: { taskId: args.taskId },
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
        });

        return fields;
      } catch (error: any) {
        console.error("Failed to fetch dropdown fields:", error.message);
        throw error;
      }
    },
  })
);

// Get selected options for a task
builder.queryField("taskSelectedOptions", (t) =>
  t.field({
    type: [TaskSelectedOptionType],
    args: {
      taskId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }

        // Verify access
        const task = await ctx.prisma.task.findUnique({
          where: { id: args.taskId },
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
          throw new Error("Task not found");
        }

        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          throw new Error("Access denied");
        }

        const selected = await ctx.prisma.taskSelectedOption.findMany({
          where: { taskId: args.taskId },
          include: {
            option: {
              include: {
                field: true,
              },
            },
          },
        });

        return selected;
      } catch (error: any) {
        console.error("Failed to fetch selected options:", error.message);
        throw error;
      }
    },
  })
);

// ==================== MUTATIONS ====================

// Create a dropdown field for a task
builder.mutationField("createTaskDropdownField", (t) =>
  t.field({
    type: DropdownFieldPayload,
    args: {
      taskId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { taskId, name, description } = args;

        // Verify task access
        const task = await ctx.prisma.task.findUnique({
          where: { id: taskId },
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

        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied");
        }

        // Validate name
        if (!name || name.trim().length === 0) {
          return fail("Field name is required", ["VALIDATION_ERROR"]);
        }

        if (name.length > 50) {
          return fail("Field name must be less than 50 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        // Check for duplicate field names
        const existingField = await ctx.prisma.taskDropdownField.findUnique({
          where: {
            taskId_name: {
              taskId,
              name: name.trim(),
            },
          },
        });

        if (existingField) {
          return fail("A field with this name already exists for this task", [
            "DUPLICATE_FIELD",
          ]);
        }

        // Create field
        const field = await ctx.prisma.taskDropdownField.create({
          data: {
            taskId,
            name: name.trim(),
            description: description?.trim(),
          },
          include: {
            options: true,
          },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.FIELD_CREATED, {
          taskId,
          fieldId: field.id,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: field,
        });

        return success("Dropdown field created successfully", { data: field });
      } catch (error: any) {
        return fail("Failed to create dropdown field", [error.message]);
      }
    },
  })
);

// Create a dropdown option
builder.mutationField("createTaskDropdownOption", (t) =>
  t.field({
    type: DropdownOptionPayload,
    args: {
      fieldId: t.arg.string({ required: true }),
      label: t.arg.string({ required: true }),
      color: t.arg.string({ required: false }),
      order: t.arg.int({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { fieldId, label, color, order } = args;

        // Verify field exists and user has access
        const field = await ctx.prisma.taskDropdownField.findUnique({
          where: { id: fieldId },
          include: {
            task: {
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
            },
          },
        });

        if (!field) {
          return fail("Dropdown field not found");
        }

        const isMember = field.task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied");
        }

        // Validate label
        if (!label || label.trim().length === 0) {
          return fail("Option label is required", ["VALIDATION_ERROR"]);
        }

        if (label.length > 50) {
          return fail("Option label must be less than 50 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        // Check for duplicate labels in this field
        const existingOption = await ctx.prisma.taskDropdownOption.findUnique({
          where: {
            fieldId_label: {
              fieldId,
              label: label.trim(),
            },
          },
        });

        if (existingOption) {
          return fail("An option with this label already exists", [
            "DUPLICATE_OPTION",
          ]);
        }

        // Get current max order to auto-increment
        const lastOption = await ctx.prisma.taskDropdownOption.findFirst({
          where: { fieldId },
          orderBy: { order: "desc" },
        });

        const optionOrder = order ?? (lastOption?.order ?? 0) + 1;

        // Create option
        const option = await ctx.prisma.taskDropdownOption.create({
          data: {
            fieldId,
            label: label.trim(),
            color: color?.trim(),
            order: optionOrder,
          },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.OPTION_CREATED, {
          taskId: field.taskId,
          fieldId,
          optionId: option.id,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: option,
        });

        return success("Option created successfully", { data: option });
      } catch (error: any) {
        return fail("Failed to create dropdown option", [error.message]);
      }
    },
  })
);

// Update dropdown option
builder.mutationField("updateTaskDropdownOption", (t) =>
  t.field({
    type: DropdownOptionPayload,
    args: {
      id: t.arg.string({ required: true }),
      label: t.arg.string({ required: false }),
      color: t.arg.string({ required: false }),
      order: t.arg.int({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id, label, color, order } = args;

        // Verify option exists and user has access
        const option = await ctx.prisma.taskDropdownOption.findUnique({
          where: { id },
          include: {
            field: {
              include: {
                task: {
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
                },
              },
            },
          },
        });

        if (!option) {
          return fail("Option not found");
        }

        const isMember = option.field.task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied");
        }

        // Build update data
        const updateData: any = {};

        if (label !== undefined) {
          if (!label || label.trim().length === 0) {
            return fail("Option label cannot be empty", ["VALIDATION_ERROR"]);
          }
          if (label.length > 50) {
            return fail("Option label must be less than 50 characters", [
              "VALIDATION_ERROR",
            ]);
          }
          updateData.label = label.trim();
        }

        if (color !== undefined) {
          updateData.color = color?.trim() || null;
        }

        if (order !== undefined) {
          updateData.order = order;
        }

        const updated = await ctx.prisma.taskDropdownOption.update({
          where: { id },
          data: updateData,
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.OPTION_UPDATED, {
          taskId: option.field.taskId,
          fieldId: option.fieldId,
          optionId: id,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: updated,
        });

        return success("Option updated successfully", { data: updated });
      } catch (error: any) {
        return fail("Failed to update dropdown option", [error.message]);
      }
    },
  })
);

// Delete dropdown option
builder.mutationField("deleteTaskDropdownOption", (t) =>
  t.field({
    type: DropdownOptionPayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id } = args;

        // Verify option exists and user has access
        const option = await ctx.prisma.taskDropdownOption.findUnique({
          where: { id },
          include: {
            field: {
              include: {
                task: {
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
                },
              },
            },
          },
        });

        if (!option) {
          return fail("Option not found");
        }

        const isMember = option.field.task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied");
        }

        // Delete option (and cascade to selections)
        await ctx.prisma.taskDropdownOption.delete({
          where: { id },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.OPTION_DELETED, {
          taskId: option.field.taskId,
          fieldId: option.fieldId,
          optionId: id,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: { id },
        });

        return success("Option deleted successfully");
      } catch (error: any) {
        return fail("Failed to delete dropdown option", [error.message]);
      }
    },
  })
);

// Select an option for a task
builder.mutationField("selectTaskDropdownOption", (t) =>
  t.field({
    type: TaskSelectedOptionType,
    args: {
      taskId: t.arg.string({ required: true }),
      optionId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }

        const { taskId, optionId } = args;

        // Verify task access
        const task = await ctx.prisma.task.findUnique({
          where: { id: taskId },
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
          throw new Error("Task not found");
        }

        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          throw new Error("Access denied");
        }

        // Verify option exists
        const option = await ctx.prisma.taskDropdownOption.findUnique({
          where: { id: optionId },
        });

        if (!option) {
          throw new Error("Option not found");
        }

        // Check if already selected
        const existing = await ctx.prisma.taskSelectedOption.findUnique({
          where: {
            taskId_optionId: {
              taskId,
              optionId,
            },
          },
        });

        if (existing) {
          return existing;
        }

        // Create selection
        const selected = await ctx.prisma.taskSelectedOption.create({
          data: {
            taskId,
            optionId,
          },
          include: {
            option: true,
          },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.OPTION_SELECTED, {
          taskId,
          optionId,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: selected,
        });

        return selected;
      } catch (error: any) {
        console.error("Failed to select option:", error.message);
        throw error;
      }
    },
  })
);

// Deselect an option from a task
builder.mutationField("deselectTaskDropdownOption", (t) =>
  t.field({
    type: "Boolean",
    args: {
      taskId: t.arg.string({ required: true }),
      optionId: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }

        const { taskId, optionId } = args;

        // Verify task access
        const task = await ctx.prisma.task.findUnique({
          where: { id: taskId },
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
          throw new Error("Task not found");
        }

        const isMember = task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          throw new Error("Access denied");
        }

        // Delete selection
        await ctx.prisma.taskSelectedOption.deleteMany({
          where: {
            taskId,
            optionId,
          },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.OPTION_DESELECTED, {
          taskId,
          optionId,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: { taskId, optionId },
        });

        return true;
      } catch (error: any) {
        console.error("Failed to deselect option:", error.message);
        throw error;
      }
    },
  })
);

// Delete dropdown field
builder.mutationField("deleteTaskDropdownField", (t) =>
  t.field({
    type: DropdownFieldPayload,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        const { id } = args;

        // Verify field exists and user has access
        const field = await ctx.prisma.taskDropdownField.findUnique({
          where: { id },
          include: {
            task: {
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
            },
          },
        });

        if (!field) {
          return fail("Dropdown field not found");
        }

        const isMember = field.task.project.workspace.members.some(
          (member) => member.userId === ctx.user!.id
        );

        if (!isMember) {
          return fail("Access denied");
        }

        // Delete field (cascades to options and selections)
        await ctx.prisma.taskDropdownField.delete({
          where: { id },
        });

        // Publish event for real-time updates
        publishDropdownEvent(DropdownEventType.FIELD_DELETED, {
          taskId: field.taskId,
          fieldId: id,
          userId: ctx.user!.id,
          timestamp: new Date(),
          data: { id },
        });

        return success("Dropdown field deleted successfully");
      } catch (error: any) {
        return fail("Failed to delete dropdown field", [error.message]);
      }
    },
  })
);
