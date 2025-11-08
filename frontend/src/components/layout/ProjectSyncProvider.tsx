import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { projectApi } from "@/api/project.api";
import { useProjectStore } from "@/stores/project.store";

/**
 * ProjectSyncProvider component handles automatic project selection based on URL slug.
 * This ensures that when navigating to a project route, the correct project data
 * is fetched and set as the current project in the store.
 *
 * This component should be rendered inside the Layout component and is transparent to the UI.
 */
export function ProjectSyncProvider() {
  const params = useParams<{ workspaceSlug?: string; projectSlug?: string }>();
  const location = useLocation();
  const { currentProject, setCurrentProject } = useProjectStore();

  useEffect(() => {
    const syncProject = async () => {
      // Only sync if we have both workspace and project slugs
      if (!params.workspaceSlug || !params.projectSlug) {
        setCurrentProject(null);
        return;
      }

      // Avoid unnecessary re-fetching if we already have the correct project
      if (currentProject?.slug === params.projectSlug) {
        return;
      }

      try {
        const project = await projectApi.getProjectBySlug(
          params.workspaceSlug,
          params.projectSlug
        );
        setCurrentProject(project);
      } catch (error) {
        console.error("Failed to sync project:", error);
        setCurrentProject(null);
      }
    };

    syncProject();
  }, [
    params.workspaceSlug,
    params.projectSlug,
    location.pathname,
    currentProject?.slug,
    setCurrentProject,
  ]);

  // This component doesn't render anything, it's purely for side effects
  return null;
}
