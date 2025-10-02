import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Ensure we have valid URLs
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const REQUIRE_EMAIL_VERIFICATION =
  process.env.REQUIRE_EMAIL_VERIFICATION === "true";

console.log("🔐 Initializing Better Auth...");
console.log("  BASE_URL:", BASE_URL);
console.log("  FRONTEND_URL:", FRONTEND_URL);
console.log("  REQUIRE_EMAIL_VERIFICATION:", REQUIRE_EMAIL_VERIFICATION);

// Email transporter configuration (Gmail SMTP)
// Only create transporter if email verification is enabled
const transporter = REQUIRE_EMAIL_VERIFICATION
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // App-specific password
      },
    })
  : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "fallback-secret-for-dev",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      if (!transporter) {
        console.log(
          "⚠️  Email verification disabled - skipping password reset email"
        );
        return;
      }
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Your Password - Sunny Task Buddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: REQUIRE_EMAIL_VERIFICATION,
    sendVerificationEmail: async ({ user, url }) => {
      if (!transporter) {
        console.log(
          "⚠️  Email verification disabled - skipping verification email"
        );
        return;
      }
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify Your Email - Sunny Task Buddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Sunny Task Buddy!</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email
            </a>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Prevent automatic account linking
      // Users must manually link from settings
      allowDangerousEmailAccountLinking: false,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    // Disable cookie cache - use database sessions instead
    cookieCache: {
      enabled: false,
    },
  },

  // Security settings
  advanced: {
    cookiePrefix: "sunny-task-buddy",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieSettings: {
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },

  // Base URL for redirects - REQUIRED for Better Auth to work
  baseURL: BASE_URL,

  // Trust proxy (important for production behind reverse proxy)
  trustedOrigins: [FRONTEND_URL],
});

console.log("✅ Better Auth initialized successfully!");

export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
