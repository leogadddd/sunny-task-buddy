import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";

import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
  credentials: "include", // Important: sends cookies with requests
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log({
          message: "[GraphQL error]: Message: " + message,
          locations,
          path,
        })
      );
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);

      // Handle 401 errors by redirecting to auth
      if ("statusCode" in networkError && networkError.statusCode === 401) {
        window.location.href = "/auth";
      }

      // Transform "Failed to fetch" errors during authentication to "Authentication Failed"
      if (
        operation.operationName === "Me" &&
        networkError.message === "Failed to fetch"
      ) {
        // Create a custom error for authentication failures
        const authError = new Error("Authentication Failed");
        // You could also modify the networkError directly if needed
        console.log("Transformed network error for authentication");
      }
    }
  }
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          organizations: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          projects: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
