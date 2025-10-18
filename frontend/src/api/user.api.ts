import { apolloClient } from "@/lib/apollo/client";
import { SEARCH_USERS_QUERY } from "@/lib/apollo/queries";
import { User } from "@/interfaces/users";

export const userApi = {
  async searchUsers(
    query: string,
    workspaceId?: string,
    limit?: number
  ): Promise<User[]> {
    const result = await apolloClient.query({
      query: SEARCH_USERS_QUERY,
      variables: {
        query,
        workspaceId,
        limit: limit || 10,
      },
      fetchPolicy: "no-cache",
    });

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data.searchUsers || [];
  },
};
