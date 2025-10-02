import { PrismaClient } from "@prisma/client";
import { auth } from "../auth";
import type { AuthSession, AuthUser } from "../auth";

export interface Context {
  prisma: PrismaClient;
  session: AuthSession | null;
  user: AuthUser | null;
}

const prisma = new PrismaClient();

export const createContext = async ({
  req,
}: {
  req: any;
}): Promise<Context> => {
  // Get session from Better Auth using the request
  const session = await auth.api.getSession({ headers: req.headers });

  return {
    prisma,
    session: session?.session || null,
    user: session?.user || null,
  };
};
