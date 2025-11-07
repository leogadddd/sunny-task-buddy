import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace.store";

/**
 * WorkspaceSyncProvider component handles automatic workspace selection based on URL slug.
 * This ensures that when navigating to a workspace or project route, the correct workspace
 * is loaded and set as the current workspace in the store.
 *
 * This component should be rendered inside the Layout component and is transparent to the UI.
 */
export function WorkspaceSyncProvider() {
  const params = useParams<{ workspaceSlug?: string }>();
  const location = useLocation();
  const { getWorkspaceBySlug, currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    const syncWorkspace = async () => {
      // Only sync if we're on a workspace route and have a workspace slug
      if (!params.workspaceSlug || !location.pathname.startsWith("/w/")) {
        return;
      }

      // Avoid unnecessary re-fetching if we already have the correct workspace
      if (currentWorkspace?.slug === params.workspaceSlug) {
        return;
      }

      // Fetch and set the workspace by slug
      await getWorkspaceBySlug(params.workspaceSlug);
    };

    syncWorkspace();
  }, [
    params.workspaceSlug,
    location.pathname,
    currentWorkspace?.slug,
    getWorkspaceBySlug,
  ]);

  // This component doesn't render anything, it's purely for side effects
  return null;
}
