import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search, Loader2, UserPlus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceMember } from "@/interfaces/workspace";
import { format } from "date-fns";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddMemberDialog from "@/components/dialogs/AddMemberDialog";
import EditMemberDialog from "@/components/dialogs/EditMemberDialog";

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
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

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "EDITOR":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "VIEWER":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "INVITED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export default function WorkspaceMembers() {
  const params = useParams();
  const { currentWorkspace } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );

  const members = currentWorkspace?.members || [];

  const filteredMembers = members.filter((member) => {
    const user = member.user;
    const displayName = `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim();
    const searchTerm = searchQuery.toLowerCase();

    return (
      displayName.toLowerCase().includes(searchTerm) ||
      user?.email?.toLowerCase().includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm) ||
      member.status.toLowerCase().includes(searchTerm)
    );
  });

  const handleEditMember = (member: WorkspaceMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const invitedMembers = members.filter((m) => m.status === "INVITED");

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage workspace members and permissions
          </p>
        </div>

        <Button
          className="flex items-center"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <UserPlus className="mr-2" />
          Invite Members
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{members.length}</div>
          <p className="text-sm text-muted-foreground">Total Members</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{activeMembers.length}</div>
          <p className="text-sm text-muted-foreground">Active Members</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{invitedMembers.length}</div>
          <p className="text-sm text-muted-foreground">Pending Invites</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          className="pl-10 h-12 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {members.length === 0 ? (
              <>
                No members found.{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Invite your first member
                </button>
              </>
            ) : (
              "No members found matching your search"
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const user = member.user;
                const displayName =
                  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                  user?.email ||
                  "Unknown";
                const initials = getInitials(displayName, user?.email);
                const bg =
                  user?.color || stringToColor(member.id || displayName);

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                          style={{ backgroundColor: bg }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold">{displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {member.status === "ACTIVE" ? "Active" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditMember(member)}
                          >
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableComponent>
        </div>
      )}

      {/* Dialogs */}
      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <EditMemberDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        member={selectedMember}
      />
    </div>
  );
}
