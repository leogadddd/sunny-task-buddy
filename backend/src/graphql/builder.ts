import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "../generated/pothos-types.js";
import { prisma } from "../db/prisma.js";
import type { GraphQLContext } from "../types/context.js";

/**
 * Pothos Schema Builder with Prisma Integration
 * Provides type-safe GraphQL schema building with automatic Prisma model integration
 */

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  PrismaTypes: PrismaTypes;
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    // Automatically expose Prisma errors as GraphQL errors
    exposeDescriptions: true,
    // Use default field nullability
    filterConnectionTotalCount: true,
  },
});

// Base Query and Mutation types
builder.queryType({});
builder.mutationType({});
