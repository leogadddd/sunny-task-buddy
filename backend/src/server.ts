import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.js";
import { createContext } from "./auth/context.js";
import { logout } from "./auth/betterAuth.js";
import { buildSessionSetCookieHeader } from "./auth/helpers.js";
import "dotenv/config";

/**
 * Main server setup with Hono + GraphQL Yoga
 */

const app = new Hono();

// Enable CORS for frontend
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Create Yoga instance
const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: "UpTrack GraphQL API",
  },
  // Enable introspection in all environments for now
  graphqlEndpoint: "/graphql",
  landingPage: false,
});

// Mount GraphQL endpoint
app.all("/graphql", async (c) => {
  // Read request body text to detect login mutation and capture session token from response
  const req = c.req.raw;

  // Clone the request stream for Yoga; also buffer body for inspection
  const clonedReq = req.clone();
  let bodyText = "";
  try {
    bodyText = await clonedReq.text();
  } catch (e) {
    // ignore
  }

  const response = await yoga.fetch(c.req.raw, {
    // Pass Hono context if needed
  });

  // If the request looks like a login mutation, check response for session token
  const isLogin =
    bodyText.includes("mutation Login") || bodyText.includes("login(");

  if (isLogin) {
    try {
      const cloned = response.clone();
      const json = await cloned.json();
      const sessionToken = json?.data?.login?.data?.sessionToken;
      if (sessionToken) {
        const cookie = buildSessionSetCookieHeader(sessionToken, {
          secure: false,
        });
        // Build a new Response that includes Set-Cookie
        const headers = new Headers(response.headers);
        headers.set("Set-Cookie", cookie);
        return new Response(JSON.stringify(json), {
          status: response.status,
          headers,
        });
      }
    } catch (e) {
      // ignore parsing errors and return original response
      console.warn("Failed to parse graphql response for login cookie", e);
    }
  }

  // If the request looks like a logout mutation, check response and clear cookie
  const isLogout =
    bodyText.includes("mutation Logout") || bodyText.includes("logout(");
  if (isLogout) {
    try {
      const cloned = response.clone();
      const json = await cloned.json();
      const success = json?.data?.logout?.success;
      if (success) {
        const headers = new Headers(response.headers);
        // Expire cookie; buildSessionSetCookieHeader is for setting token, so expire manually
        const expired = `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${
          process.env.NODE_ENV === "production" ? "Secure; " : ""
        }SameSite=Lax`;
        headers.set("Set-Cookie", expired);
        return new Response(JSON.stringify(json), {
          status: response.status,
          headers,
        });
      }
    } catch (e) {
      console.warn("Failed to parse graphql response for logout cookie", e);
    }
  }

  return response;
});

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "UpTrack API is running ✅",
    version: "1.0.0",
    endpoints: {
      graphql: "/graphql",
    },
  });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// No REST sign-out endpoint: logout handled via GraphQL logout mutation which the
// /graphql handler intercepts to clear the HttpOnly session cookie.

// Start server
const PORT = process.env.PORT || 4000;

console.log(`🚀 Server starting on port ${PORT}...`);

serve(
  {
    fetch: app.fetch,
    port: Number(PORT),
  },
  (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${info.port}/graphql`);
  }
);
