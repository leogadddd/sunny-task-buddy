import { prisma } from "../db/prisma.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { getRandomColorName } from "../lib/image-color.js";

/**
 * Simple Better Auth-style implementation
 * Handles user registration, login, and session management
 */

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput) {
  const { email, password, firstName, lastName } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user with account
  const user = await prisma.user.create({
    data: {
      email,
      username: email,
      firstName,
      lastName,
      emailVerified: false,
      color: getRandomColorName(),
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: email,
          access_token: hashedPassword, // Store hashed password here
        },
      },
    },
  });

  return user;
}

/**
 * Login user and create session
 */
export async function login(input: LoginInput) {
  const { email, password } = input;

  // Find user with account
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          provider: "credentials",
        },
      },
    },
  });

  if (!user || user.accounts.length === 0) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const account = user.accounts[0];
  const isValidPassword = await bcrypt.compare(password, account.access_token!);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Create session
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  return { user, session };
}

/**
 * Get session from token
 */
export async function getSession(sessionToken: string | null) {
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return session;
}

/**
 * Logout - delete session
 */
export async function logout(sessionToken: string) {
  await prisma.session.delete({
    where: { sessionToken },
  });
}

/**
 * Get user from session token
 */
export async function getUserFromSession(sessionToken: string | null) {
  const session = await getSession(sessionToken);
  return session?.user || null;
}
