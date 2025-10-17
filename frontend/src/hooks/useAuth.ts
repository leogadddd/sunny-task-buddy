import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/lib/apollo/queries";

/**
 * Auth hook using GraphQL ME_QUERY
 * Returns current user and authentication status
 */
export function useAuth() {
  const { data, loading, error } = useQuery(ME_QUERY, {
    // Only fetch if we have a session token
    skip: !localStorage.getItem("sessionToken"),
    errorPolicy: "all",
  });

  const meResult = data?.me;
  const user = meResult?.success ? meResult.data?.user : null;

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
