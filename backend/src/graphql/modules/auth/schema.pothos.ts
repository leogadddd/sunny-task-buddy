import { builder } from "../../builder.js";
import { register, login, logout } from "../../../auth/betterAuth.js";
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
    name: t.exposeString("name", { nullable: true }),
    emailVerified: t.exposeBoolean("emailVerified"),
    createdAt: t.string({
      resolve: (user) => user.createdAt.toISOString(),
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
        return fail("Authentication check failed", [error.message]);
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
      name: t.arg.string({ required: false }),
    },
    resolve: async (_, args, ctx) => {
      try {
        const { email, password, name } = args;

        // Basic validation
        if (!email || !password) {
          return fail("Email and password are required", ["VALIDATION_ERROR"]);
        }

        if (password.length < 6) {
          return fail("Password must be at least 6 characters", [
            "VALIDATION_ERROR",
          ]);
        }

        const user = await register({
          email,
          password,
          name: name ?? undefined,
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

        const result = await login({ email, password });

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

        await logout(ctx.session.sessionToken);

        return success("Logged out successfully");
      } catch (error: any) {
        return fail("Logout failed", [error.message]);
      }
    },
  })
);
