import { User } from "@/interfaces/users";
import { Workspace } from "@/interfaces/workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { CornerDownRight, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type roles = "ADMIN" | "EDITOR" | "VIEWER";

interface WorkspaceContextMenuItemProps {
  name: string;
  role: roles[];
  Icon: React.ReactNode;
  className?: string;
  onClick: () => void;
  confirm?: {
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    confirmClassName?: string;
  };
}

const WorkspaceContextMenuItem = ({
  name,
  Icon,
  className,
  onClick,
  role,
}: WorkspaceContextMenuItemProps) => {
  const { user } = useAuth();

  return (
    <button
      onClick={onClick}
      className={`text-sm flex items-center space-x-2 w-full px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${className}`}
    >
      {Icon}
      <span>{name}</span>
    </button>
  );
};

export default function WorkspaceContextMenu({
  workspace,
  User,
  onAction,
  onEdit,
}: {
  workspace: Workspace;
  User: User;
  onAction: () => void;
  onEdit: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentConfirm, setCurrentConfirm] = useState<{
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    confirmClassName?: string;
  } | null>(null);
  const [currentAction, setCurrentAction] = useState<(() => void) | null>(null);
  const navigate = useNavigate();
  const {
    deleteWorkspace,
    currentWorkspace,
    setCurrentWorkspace,
    removeMember,
  } = useWorkspaceStore();

  // Get user's role from workspace members
  const userRole = workspace.members.find(
    (member) => member.user.id === User.id
  )?.role as roles | undefined;

  const onConfirmNeeded = (
    confirm: {
      title: string;
      description: React.ReactNode;
      confirmText?: string;
      confirmClassName?: string;
    },
    action: () => void
  ) => {
    setCurrentConfirm(confirm);
    setCurrentAction(() => action);
    setIsConfirmOpen(true);
    // Don't close menu here, let the confirm handle it
  };
  const menu: WorkspaceContextMenuItemProps[] = [
    {
      name: `Open ${workspace.name}`,
      role: ["ADMIN", "EDITOR", "VIEWER"],
      Icon: <CornerDownRight className="w-4 h-4" />,
      onClick: () => {
        if (currentWorkspace?.id !== workspace.id) {
          navigate(`/w/${workspace.slug}`);
          setCurrentWorkspace(workspace);
          onAction();
        }
      },
    },
    {
      name: "Edit",
      role: ["ADMIN"],
      Icon: <Pencil className="w-4 h-4" />,
      onClick: () => {
        if (workspace.createdBy.id !== User.id) {
          toast.error("You do not have permission to delete this workspace");
          return;
        }

        onEdit();
        onAction();
      },
    },
    {
      name: "Leave Workspace",
      Icon: <CornerDownRight className="w-4 h-4 rotate-180" />,
      role: ["EDITOR", "VIEWER"],
      className: "text-red-500",
      onClick: async () => {
        try {
          await removeMember(workspace.id, User.id, true);

          // If currently viewing this workspace, navigate to dashboard
          if (currentWorkspace?.id === workspace.id) {
            setCurrentWorkspace(null);
            navigate("/dashboard");
          }

          onAction(); // close the menu
        } catch (error: unknown) {
          // Toast is already handled by the store
        }
      },
      confirm: {
        title: `Leave "${workspace.name}"?`,
        description: (
          <>
            You will no longer have access to this workspace. You can rejoin if
            you receive a new invitation.
          </>
        ),
        confirmText: "Leave",
        confirmClassName: "bg-red-500 hover:bg-red-600",
      },
    },
    {
      name: "Delete",
      role: ["ADMIN"],
      Icon: <Trash className="w-4 h-4" />,
      className: "text-red-500",

      onClick: async () => {
        if (workspace.createdBy.id !== User.id) {
          toast.error("You do not have permission to delete this workspace");
          return;
        }

        const result = deleteWorkspace(workspace.id);
        await result;

        if (result) {
          if (currentWorkspace?.id === workspace.id) {
            setCurrentWorkspace(null);
            navigate("/dashboard");
          }
        }
      },
      confirm: {
        title: `Delete "${workspace.name}"?`,
        description: (
          <>
            This action cannot be undone and will permanently remove the
            workspace and all its data.
          </>
        ),
        confirmText: "Delete",
        confirmClassName: "bg-red-500 hover:bg-red-600",
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col mt-1">
        {menu.map((item) => {
          // Show menu item only if user's role is in the allowed roles
          const isAllowed = userRole && item.role.includes(userRole);

          if (!isAllowed) return null;

          return (
            <WorkspaceContextMenuItem
              key={item.name}
              name={item.name}
              role={item.role}
              Icon={item.Icon}
              className={item.className}
              onClick={
                item.confirm
                  ? () => onConfirmNeeded(item.confirm, item.onClick)
                  : item.onClick
              }
            />
          );
        })}
      </div>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={currentConfirm?.title || ""}
        description={currentConfirm?.description || ""}
        onConfirm={async () => {
          if (currentAction) await currentAction();
          setIsConfirmOpen(false);
          onAction(); // close the menu after action
        }}
        confirmText={currentConfirm?.confirmText}
        confirmClassName={currentConfirm?.confirmClassName}
      />
    </>
  );
}
