import type { User, Session } from "@prisma/client";
import type { prisma } from "../db/prisma.js";

/**
 * GraphQL Context interface
 * Available in all resolvers
 */
export interface GraphQLContext {
  prisma: typeof prisma;
  user: User | null;
  session: Session | null;
}
