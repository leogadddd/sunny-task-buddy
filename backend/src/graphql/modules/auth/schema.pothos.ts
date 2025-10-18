import { builder } from "../../builder.js";
import {
  createUserWithCredentials,
  authenticateAndCreateSession,
  revokeSessionAndClearCookie,
} from "../../../auth/helpers.js";
import { getColor } from "../../../lib/image-color.js";
import { success, fail } from "../../utils/response.js";

/**
 * Pothos-based Auth Types and Resolvers
 * Auto-generated from Prisma schema with full type safety
 */

// User type from Prisma model
const UserType = builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    username: t.exposeString("username"),
    firstName: t.exposeString("firstName", { nullable: true }),
    lastName: t.exposeString("lastName", { nullable: true }),
    image: t.exposeString("image", { nullable: true }),
    bio: t.exposeString("bio", { nullable: true }),
    color: t.string({
      resolve: (user) => getColor(user.color),
    }),
    emailVerified: t.exposeBoolean("emailVerified"),
    createdAt: t.string({
      resolve: (user) => user.createdAt.toISOString(),
    }),
  }),
});

// Basic User type (only id and name)
// Note: Prisma may return `name` as string | null, so reflect that in the TS shape
const UserBasic = builder
  .objectRef<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    color: string;
  }>("UserBasic")
  .implement({
    fields: (t) => ({
      id: t.exposeID("id"),
      firstName: t.exposeString("firstName", { nullable: true }),
      lastName: t.exposeString("lastName", { nullable: true }),
      image: t.exposeString("image", { nullable: true }),
      color: t.string({
        resolve: (user) => getColor(user.color),
      }),
    }),
  });

// AuthData type for response payload
const AuthData = builder
  .objectRef<{
    user: any;
    sessionToken?: string;
  }>("AuthData")
  .implement({
    fields: (t) => ({
      user: t.field({
        type: UserType,
        nullable: true,
        resolve: (parent) => parent.user,
      }),
      sessionToken: t.string({
        nullable: true,
        resolve: (parent) => parent.sessionToken,
      }),
    }),
  });

// AuthPayload type for unified responses
const AuthPayload = builder
  .objectRef<{
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
  }>("AuthPayload")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      data: t.field({
        type: AuthData,
        nullable: true,
        resolve: (parent) => parent.data,
      }),
      errors: t.stringList({
        nullable: true,
        resolve: (parent) => parent.errors,
      }),
    }),
  });

// Queries
builder.queryField("me", (t) =>
  t.field({
    type: AuthPayload,
    resolve: async (_, __, ctx) => {
      try {
        if (!ctx.user) {
          return fail("Not authenticated");
        }

        return success("Authenticated", {
          user: ctx.user,
          sessionToken: ctx.session?.sessionToken,
        });
      } catch (error: any) {
        return fail("Not authenticated", [error.message]);
      }
    },
  })
);

// Search users by username or email (excluding workspace members)
builder.queryField("searchUsers", (t) =>
  t.field({
    type: [UserType],
    args: {
      query: t.arg.string({ required: true }),
      workspaceId: t.arg.string({ required: false }),
      limit: t.arg.int({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        if (!ctx.user) {
          return [];
        }

        const { query, workspaceId } = args;
        const limit = args.limit ?? 10;

        if (!query || query.trim().length < 2) {
          return [];
        }

        // Search by username or email
        const users = await ctx.prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
            // Don't return the current user
            id: { not: ctx.user.id },
          },
          take: limit,
        });

        // If workspaceId provided, filter out existing members
        if (workspaceId) {
          const existingMembers = await ctx.prisma.workspaceMember.findMany({
            where: { workspaceId },
            select: { userId: true },
          });

          const existingUserIds = new Set(existingMembers.map((m) => m.userId));

          return users.filter((u) => !existingUserIds.has(u.id));
        }

        return users;
      } catch (error: any) {
        console.error("Search users error:", error);
        return [];
      }
    },
  })
);

builder.queryField("user", (t) =>
  t.field({
    type: UserBasic,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: args.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            color: true,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Prisma returns a plain object matching { id, firstName, lastName }
        return user;
      } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
    },
  })
);

// Mutations
builder.mutationField("register", (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      firstName: t.arg.string({ required: false }),
      lastName: t.arg.string({ required: false }),
      // name: t.arg.string({ required: false }), --- IGNORE ---
    },
    resolve: async (_, args, ctx) => {
      try {
        const { email, password, firstName, lastName } = args;

        // Basic validation
        if (!email || !password) {
          return fail("Email and password are required", ["VALIDATION_ERROR"]);
        }

        if (password.length < 6) {
          return fail("Password must be at least 6 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        const user = await createUserWithCredentials({
          email,
          password,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
        });

        return success("User registered successfully", { user });
      } catch (error: any) {
        return fail("Registration failed", [error.message]);
      }
    },
  })
);

builder.mutationField("login", (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      try {
        const { email, password } = args;

        // Basic validation
        if (!email || !password) {
          return fail("Email and password are required", ["VALIDATION_ERROR"]);
        }

        const result = await authenticateAndCreateSession({ email, password });

        return success("Login successful", {
          user: result.user,
          sessionToken: result.session.sessionToken,
        });
      } catch (error: any) {
        return fail("Login failed", [error.message]);
      }
    },
  })
);

builder.mutationField("logout", (t) =>
  t.field({
    type: AuthPayload,
    resolve: async (_, __, ctx) => {
      try {
        if (!ctx.session) {
          return fail("No active session");
        }

        await revokeSessionAndClearCookie(ctx.session.sessionToken);

        return success("Logged out successfully");
      } catch (error: any) {
        return fail("Logout failed", [error.message]);
      }
    },
  })
);
