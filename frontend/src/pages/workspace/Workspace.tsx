import { useWorkspaceStore } from "@/stores/workspace.store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { workspaceApi } from "@/api/workspace.api";
import { Workspace as WorkspaceType } from "@/interfaces/workspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  CheckCircle2,
  Folder,
  ListTodo,
  Archive,
} from "lucide-react";
import MembersList from "@/components/workspace/MembersList";
import { WorkspaceIcon } from "@/components/workspace-sidebar/WorkspaceIcon";
import { useLoading } from "@/hooks/useLoading";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import ProjectsList from "@/components/workspace/ProjectsList";
import { InvitationModal } from "@/components/dialogs/InvitationModal";

export default function Workspace() {
  const params = useParams();
  const { isLoading, setIsLoading } = useLoading();
  const { user, isAuthenticated } = useAuth();
  const { setCurrentWorkspace, currentWorkspace, getWorkspaceBySlug } =
    useWorkspaceStore();
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!params.slug || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);

        // Always fetch the workspace to ensure fresh data
        const ws = await getWorkspaceBySlug(params.slug);

        if (ws) {
          setWorkspace(ws);
          // Check user membership status
          const userMember = ws.members.find(
            (member) => member.user.id === user?.id
          );
          if (userMember) {
            if (userMember.status === "ACTIVE") {
              setIsAuthorized(true);
              setShowInvitationModal(false);
            } else if (userMember.status === "INVITED") {
              setIsAuthorized(false);
              setShowInvitationModal(true);
              // console.log("User is invited to the workspace");
            }
          } else {
            setIsAuthorized(false);
            setShowInvitationModal(false);
          }
          setCurrentWorkspace(ws);
        } else {
          setIsAuthorized(false);
          setShowInvitationModal(false);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.slug,
    isAuthenticated,
    user?.id,
    setIsLoading,
    getWorkspaceBySlug,
  ]);

  // Sync local workspace with store changes
  useEffect(() => {
    if (currentWorkspace && currentWorkspace.slug === params.slug) {
      setWorkspace(currentWorkspace);
      const userMember = currentWorkspace.members.find(
        (member) => member.user.id === user?.id
      );
      if (userMember) {
        if (userMember.status === "ACTIVE") {
          setIsAuthorized(true);
          setShowInvitationModal(false);
        } else if (userMember.status === "INVITED") {
          setIsAuthorized(false);
          setShowInvitationModal(true);
        }
      } else {
        setIsAuthorized(false);
        setShowInvitationModal(false);
      }
    }
  }, [currentWorkspace, params.slug, user?.id]);

  const handleAcceptInvitation = () => {
    setIsAuthorized(true);
    setShowInvitationModal(false);
  };

  const handleDeclineInvitation = () => {
    setShowInvitationModal(false);
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading workspace...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">{error}</p>
        <Link to="/workspaces">
          <Button variant="outline" className="mt-4">
            <Home className="mr-2" />
            Back to Workspaces
          </Button>
        </Link>
      </div>
    );
  }

  if (!isAuthorized && !showInvitationModal) {
    return null;
  }

  return (
    <>
      <InvitationModal
        open={showInvitationModal}
        onOpenChange={setShowInvitationModal}
        workspace={workspace}
        userId={user?.id || ""}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
      />
      {isAuthorized && (
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <WorkspaceIcon
                name={workspace?.name}
                color={workspace?.color}
                size="lg"
              />
              <div>
                <h1 className="text-3xl font-bold">{workspace?.name}</h1>
                {workspace?.description && (
                  <p className="text-muted-foreground">
                    {workspace.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MembersList />
            </div>
          </div>

          {}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Completion Rate"
              value="68%"
              description="+2.5% from last week"
              icon={CheckCircle2}
              iconColor="text-emerald-500"
            />

            <DashboardCard
              title="Projects"
              value="12"
              description="4 active projects"
              icon={Folder}
              iconColor="text-blue-500"
            />

            <DashboardCard
              title="Tasks"
              value="48"
              description="24 in progress"
              icon={ListTodo}
              iconColor="text-amber-500"
            />

            <DashboardCard
              title="Backlogs"
              value="16"
              description="Pending items"
              icon={Archive}
              iconColor="text-purple-500"
            />
          </div>
          <div className="mt-12 mb-12">
            <ProjectsList />
          </div>
        </div>
      )}
    </>
  );
}
