import { useQuery, ApolloError } from "@apollo/client";
import { ME_QUERY } from "@/lib/apollo/queries";
import { User } from "@/interfaces/users";

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  user: User | null;
  session: { token: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: ApolloError | undefined;
}

/**
 * Auth hook using GraphQL ME_QUERY
 * Returns current user and authentication status
 */
export function useAuth(): UseAuthReturn {
  const { data, loading, error } = useQuery(ME_QUERY, {
    // Let server determine authentication via HttpOnly cookie
    errorPolicy: "all",
  });

  const meResult = data?.me;
  const user = meResult?.success ? meResult.data?.user : null;

  // Transform network errors for authentication
  if (error && error.message === "Failed to fetch") {
    error.message = "Authentication Failed";
  }

  return {
    user,
    session: meResult?.data?.sessionToken
      ? { token: meResult.data.sessionToken }
      : null,
    isLoading: loading,
    isAuthenticated: !!user,
    error: !meResult?.success ? meResult?.errors : error,
  };
}
