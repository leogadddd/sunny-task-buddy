import { prisma } from "../db/prisma.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import {
  login as loginCore,
  register as registerCore,
  logout as logoutCore,
  getUserFromSession as getUserFromSessionCore,
} from "./betterAuth.js";
import { getRandomColorName } from "../lib/image-color.js";

const SALT_ROUNDS = 10;

export async function createUserWithCredentials({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!email || !password) throw new Error("Missing credentials");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User with this email already exists");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      username: email,
      firstName,
      lastName,
      color: getRandomColorName(),
      emailVerified: false,
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: email,
          access_token: hashed,
        },
      },
    },
    include: { accounts: true },
  });

  return user;
}

export async function authenticateAndCreateSession({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // Reuse existing login logic which creates a session
  const result = await loginCore({ email, password });
  return result; // { user, session }
}

export function buildSessionSetCookieHeader(
  sessionToken: string,
  opts?: { maxAgeDays?: number; secure?: boolean }
) {
  const maxAge = (opts?.maxAgeDays ?? 30) * 24 * 60 * 60;
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = opts?.secure ?? isProd;
  const secure = secureFlag ? "Secure; " : "";
  return `session=${sessionToken}; Path=/; Max-Age=${maxAge}; HttpOnly; ${secure}SameSite=Lax`;
}

export async function revokeSessionAndClearCookie(
  sessionToken?: string | null
) {
  if (sessionToken) {
    await logoutCore(sessionToken);
  }

  return `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`;
}

export async function getUserFromSessionToken(token?: string | null) {
  return getUserFromSessionCore(token ?? null);
}

export async function getWorkspaceMembersBasicBySlug(slug: string) {
  const ws = await prisma.workspace.findUnique({
    where: { slug },
    select: {
      members: {
        select: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          role: true,
          status: true,
        },
      },
    },
  });
  return (
    ws?.members.map((m) => ({ ...m.user, role: m.role, status: m.status })) ??
    []
  );
}

export function sanitizeUserForResponse(user: any) {
  if (!user) return null;
  const { accounts, ...rest } = user;
  return rest;
}

export default {
  createUserWithCredentials,
  authenticateAndCreateSession,
  buildSessionSetCookieHeader,
  revokeSessionAndClearCookie,
  getUserFromSessionToken,
  getWorkspaceMembersBasicBySlug,
  sanitizeUserForResponse,
};
