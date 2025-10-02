import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  basePath: "/api/auth", // Explicitly set the auth base path
  fetchOptions: {
    credentials: "include", // Ensure cookies are sent with requests
  },
});

// Export commonly used methods from auth client
export const { signIn, signUp, signOut, useSession } = authClient;
