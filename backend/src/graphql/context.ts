import { PrismaClient } from "@prisma/client";

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
  };
}

const prisma = new PrismaClient();

export const createContext = async ({
  req,
}: {
  req: any;
}): Promise<Context> => {
  // TODO: Add JWT token verification
  // const token = req.headers.authorization?.replace('Bearer ', '');
  // const user = await verifyToken(token);

  return {
    prisma,
    // user,
  };
};
