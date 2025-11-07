import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLoading } from "@/hooks/useLoading";
import { projectApi } from "@/api/project.api";
import { Project as ProjectType } from "@/interfaces/project";
import { Workspace } from "@/interfaces/workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

export default function Project() {
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useLoading();
  const { isAuthenticated } = useAuth();
  const { currentWorkspace } = useWorkspaceStore();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.workspaceSlug || !params.projectSlug || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        // Fetch project by slug
        const proj = await projectApi.getProjectBySlug(
          params.workspaceSlug,
          params.projectSlug
        );

        if (proj) {
          setProject(proj);
          // Backend authorization already ensures user has access to this workspace/project
          setIsAuthorized(true);
        } else {
          setError("Project not found");
          toast.error("Project not found");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load project";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceSlug, params.projectSlug, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Error Loading Project</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to view this project
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div>
        <Link
          to={`/w/${params.workspaceSlug}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to {currentWorkspace?.name}
        </Link>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Tasks Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <p className="mt-4 text-center text-muted-foreground">
          No tasks yet. Create one to get started!
        </p>
      </div>
    </div>
  );
}
