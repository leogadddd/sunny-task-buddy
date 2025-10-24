import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceMember } from "@/api/workspace.api";
import { toast } from "sonner";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: WorkspaceMember | null;
}

export default function EditMemberDialog({
  open,
  onOpenChange,
  member,
}: EditMemberDialogProps) {
  const { currentWorkspace, isLoading, updateMemberRole, removeMember } =
    useWorkspaceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "ADMIN" | "EDITOR" | "VIEWER"
  >(member?.role || "VIEWER");
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  // Update selected role when member changes
  React.useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  const displayName =
    member?.user?.firstName || member?.user?.lastName
      ? `${member?.user?.firstName || ""} ${
          member?.user?.lastName || ""
        }`.trim()
      : member?.user?.email || "Unknown";

  const handleRoleChange = async (newRole: string) => {
    if (!currentWorkspace || !member) return;

    try {
      setIsSubmitting(true);
      await updateMemberRole(
        currentWorkspace.id,
        member.user.id,
        newRole as "ADMIN" | "EDITOR" | "VIEWER"
      );
      setSelectedRole(newRole as "ADMIN" | "EDITOR" | "VIEWER");
    } catch (error) {
      console.error("Failed to update member role:", error);
      // Toast is handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!currentWorkspace || !member) return;

    try {
      setIsSubmitting(true);
      await removeMember(currentWorkspace.id, member.user.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to remove member:", error);
      // Toast is handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDescriptions: Record<"ADMIN" | "EDITOR" | "VIEWER", string> = {
    ADMIN: "Full access to manage workspace and members",
    EDITOR: "Can create and edit projects and tasks",
    VIEWER: "Read-only access to view projects and tasks",
  };

  if (!member) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit {member.user?.firstName}</DialogTitle>
            <DialogDescription>Manage role and permissions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={selectedRole}
                onValueChange={handleRoleChange}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger className="border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role Info */}
          <Collapsible defaultOpen={false} onOpenChange={setIsCollapsibleOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-between h-auto px-3 py-2 bg-muted/30 hover:bg-muted/30 rounded-xl ${
                  isCollapsibleOpen ? "rounded-b-none" : ""
                }`}
              >
                <span className="text-xs font-medium">Role Permissions</span>
                <ChevronDown className="w-4 h-4 transition-transform" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-muted-foreground space-y-1 p-3 pt-1 bg-muted/30 rounded-b-xl">
              <p>
                • <strong>Admin:</strong> Full access to manage workspace and
                members
              </p>
              <p>
                • <strong>Editor:</strong> Can create and edit projects and
                tasks
              </p>
              <p>
                • <strong>Viewer:</strong> Read-only access to view projects and
                tasks
              </p>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isLoading}
              className="w-full rounded-lg h-full"
            >
              <Trash2 className="w-4 h-4" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {displayName} from the workspace?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
