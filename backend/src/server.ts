import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.js";
import { createContext } from "./auth/context.js";
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
  const response = await yoga.fetch(c.req.raw, {
    // Pass Hono context if needed
  });
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
