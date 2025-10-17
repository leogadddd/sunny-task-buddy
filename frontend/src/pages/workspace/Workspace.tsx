import { useWorkspaceStore } from "@/stores/workspace.store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { workspaceApi, Workspace as WorkspaceType } from "@/api/workspace.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Lock } from "lucide-react";

export default function Workspace() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { setCurrentWorkspace } = useWorkspaceStore();
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!params.slug || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const ws = await workspaceApi.getWorkspaceBySlug(params.slug);
        if (ws) {
          setWorkspace(ws);
          // Check if current user is a member
          const isMember = ws.members.some((member) => member.id === user?.id);
          setIsAuthorized(isMember);
          setCurrentWorkspace(ws);
        } else {
          setError("Workspace not found");
          setIsAuthorized(false);
        }
      } catch (error: any) {
        console.error("Failed to fetch workspace:", error);
        const errorMessage = error?.message || "Failed to load workspace";
        setError(errorMessage);

        // Check if it's an authorization error
        if (
          errorMessage.includes("Access denied") ||
          errorMessage.includes("not a member")
        ) {
          setIsAuthorized(false);
          toast.error("You don't have permission to view this workspace");
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [params.slug, isAuthenticated, user?.id, setCurrentWorkspace]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            You need to be logged in to access this workspace.
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">{error || "Access Denied"}</h1>
          <p className="text-muted-foreground">
            {error === "Workspace not found"
              ? "The workspace you're looking for doesn't exist."
              : "You don't have permission to access this workspace."}
          </p>
          <Button asChild>
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: workspace?.color || "#f1594a" }}
          >
            {workspace?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{workspace?.name}</h1>
            {workspace?.description && (
              <p className="text-muted-foreground">{workspace.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Members</h3>
            <p className="text-2xl font-bold text-primary">
              {workspace?.members.length}
            </p>
            <p className="text-sm text-muted-foreground">Active members</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Projects</h3>
            <p className="text-2xl font-bold text-primary">
              {workspace?.projects?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Total projects</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Tasks</h3>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Total tasks</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="space-y-3">
            {workspace?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {member.name?.charAt(0).toUpperCase() ||
                      member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.name || member.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
