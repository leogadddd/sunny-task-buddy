import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { WorkspaceIcon } from "@/components/workspace-sidebar/WorkspaceIcon";
import {
  Clock,
  Users,
  FolderOpen,
  MessageCircle,
  Target,
  Folder,
} from "lucide-react";
import { Workspace } from "@/interfaces/workspace";
import formatDate from "@/utils/formatDate";
import { workspaceApi } from "@/api/workspace.api";

interface InvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  userId: string;
  onAccept: () => void;
  onDecline: () => void;
}

const advantages = [
  { text: "Access to projects and tasks", icon: FolderOpen },
  { text: "Collaborate with the team!", icon: MessageCircle },
  { text: "Track progress and deadlines", icon: Target },
  { text: "Can see monsters with your third eye", icon: Users },
];

export function InvitationModal({
  open,
  onOpenChange,
  workspace,
  userId,
  onAccept,
  onDecline,
}: InvitationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);

    const userMember = workspace.members.find((m) => m.user.id === userId);
    if (!userMember) {
      toast.error("User member not found");
      setIsLoading(false);
      return;
    }

    try {
      // Make the API call
      await workspaceApi.answerInvitation(workspace.id, true);
      toast.success(`Invitation to ${workspace.name} accepted!`);

      // Refresh the page to get the latest state
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept invitation";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await workspaceApi.answerInvitation(workspace.id, false);
      toast.info(`Invitation to ${workspace.name} declined.`);
      onDecline();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline invitation";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md py-8 rounded-xl">
        <AlertDialogHeader className="text-center">
          <div className="flex flex-col items-center space-y-1">
            <WorkspaceIcon
              name={workspace.name}
              color={workspace.color}
              size="lg"
            />
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-muted-foreground text-lg">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1 justify-center pt-12">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
              <Clock className="h-4 w-4 mb-0.5" />
              <span className="font-medium">
                {formatDate(workspace.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
              <Users className="h-4 w-4 mb-0.5" />
              <span className="font-medium">{workspace.members.length}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
              <Folder className="h-4 w-4 mb-0.5" />
              <span className="font-medium">
                {workspace.projects ? workspace.projects.length : 0}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg p-1 py-3 space-y-2 bg-card">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                {advantages.map((advantage, index) => (
                  <li key={index} className="flex items-center gap-3 p-1 px-4">
                    <advantage.icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{advantage.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <AlertDialogDescription className="text-center text-base pt-4">
              You've been invited to join this workspace. Would you like to
              accept this invitation?
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center gap-3 pt-6">
          <AlertDialogCancel
            onClick={handleDecline}
            className="flex-1 py-3"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Decline"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAccept}
            className="bg-[#f1594a] hover:bg-[#d14a3d] text-white flex-1 py-3"
            disabled={isLoading}
          >
            {isLoading ? "Accepting..." : "Accept Invitation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
