import { builder } from "./builder.js";

/**
 * Pothos GraphQL Schema
 * Auto-generated from Prisma models with full type safety
 */

// Import all modules to register their types and fields
import "./modules/auth/schema.pothos.js";
import "./modules/workspace/schema.pothos.js";

// Build and export the schema
export const schema = builder.toSchema();
