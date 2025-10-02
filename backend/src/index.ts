import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./graphql/context";
import { auth } from "./auth";
import dotenv from "dotenv";
import { webcrypto } from "crypto";

dotenv.config();

// Make Web Crypto API available globally for Better Auth
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 4000;

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  };

  // Enable CORS and body parsing for all routes
  app.use(cors(corsOptions));
  app.use(express.json());

  // Better Auth routes - convert to Express-compatible handler
  // Using named wildcard parameter as required by path-to-regexp
  app.all("/api/auth/*path", async (req, res) => {
    try {
      // Properly convert Express headers to Web API headers
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      });

      const response = await auth.handler(
        new Request(`${req.protocol}://${req.get("host")}${req.originalUrl}`, {
          method: req.method,
          headers: headers,
          body:
            req.method !== "GET" && req.method !== "HEAD"
              ? JSON.stringify(req.body)
              : undefined,
        })
      );

      // Get response body
      const body = await response.text();

      // Copy response headers (except caching headers for auth endpoints)
      response.headers.forEach((value, key) => {
        // Skip ETag and cache-related headers for auth endpoints
        if (
          key.toLowerCase() !== "etag" &&
          key.toLowerCase() !== "cache-control"
        ) {
          res.setHeader(key, value);
        }
      });

      // Disable caching for auth endpoints
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Set status and send body
      res.status(response.status);
      res.send(body);
    } catch (error) {
      console.error("❌ Better Auth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Apollo Server setup
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  // GraphQL endpoint with Better Auth context
  // expressMiddleware handles body parsing internally
  app.use(
    "/graphql",
    cors(corsOptions),
    express.json(),
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  );

  app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    console.log(`🔐 Auth endpoint: http://localhost:${port}/api/auth/*`);
  });
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
