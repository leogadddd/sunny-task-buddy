import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceMember } from "@/interfaces/workspace";
import AddMemberDialog from "../dialogs/AddMemberDialog";
import EditMemberDialog from "../dialogs/EditMemberDialog";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

function stringToColor(str: string) {
  // Deterministic hash to get a hue
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Use pastel colors for background
  return `hsl(${hue} 70% 60%)`;
}

function getInitials(name?: string, email?: string) {
  const source = name || email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}

export default function MembersList() {
  const { currentWorkspace, isLoading } = useWorkspaceStore();
  const members = currentWorkspace?.members || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );

  const handleMemberClick = (member: WorkspaceMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {isLoading && members.length === 0 && (
            <p className="text-sm">No members</p>
          )}

          <span className="mr-4 text-xs text-muted-foreground">
            {members.length} Member{members.length !== 1 ? "s" : ""}
          </span>
          <div className="relative flex items-center h-8 pr-20">
            {members.map((m, index) => {
              const displayName =
                m.user?.firstName ||
                m.user?.lastName ||
                m.user?.email ||
                "Unknown";
              const initials = getInitials(displayName, m.user?.email);
              const bg = m.user.color || stringToColor(m.id || displayName);

              return (
                <button
                  key={m.id}
                  onClick={() => handleMemberClick(m)}
                  className="absolute cursor-pointer hover:scale-110 transition-transform hover:z-50 shadow-lg rounded-full"
                  style={{
                    left: `${members.length > 1 ? index * 20 : 0}px`,
                    zIndex: index,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: bg }}
                    title={displayName + " (" + m.user.color + ")"}
                  >
                    {initials}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add member circle */}
          <Button
            variant="secondary"
            className="flex items-center"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="mr-2" />
            Invite Members
          </Button>
        </div>
      </div>
      <AddMemberDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditMemberDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        member={selectedMember}
      />
    </>
  );
}
