import { prisma } from "../db/prisma.js";
import { getUserFromSession, getSession } from "./betterAuth.js";
import type { GraphQLContext } from "../types/context.js";

/**
 * Creates GraphQL context for each request
 * Extracts session from cookie/header and attaches user to context
 */
export async function createContext({
  request,
}: {
  request: Request;
}): Promise<GraphQLContext> {
  // Extract session token from cookie or Authorization header
  const cookieHeader = request.headers.get("cookie");
  const authHeader = request.headers.get("authorization");

  let sessionToken: string | null = null;

  // Try to get session token from cookie
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith("session="));
    if (sessionCookie) {
      sessionToken = sessionCookie.split("=")[1];
    }
  }

  // Try to get session token from Authorization header (Bearer token)
  if (!sessionToken && authHeader?.startsWith("Bearer ")) {
    sessionToken = authHeader.substring(7);
  }

  // Get user and session from token
  const user = await getUserFromSession(sessionToken);
  const session = await getSession(sessionToken);

  return {
    prisma,
    user,
    session,
  };
}
