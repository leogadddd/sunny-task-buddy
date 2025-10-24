import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { userApi } from "@/api/user.api";
import { User } from "@/interfaces/users";
import { toast } from "sonner";
import { UserPlus, X, Search, ChevronDown } from "lucide-react";

const addMembersSchema = z.object({
  searchQuery: z.string(),
});

type AddMembersForm = z.infer<typeof addMembersSchema>;

interface SelectedMember {
  user: User;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function AddMemberDialog({
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const { currentWorkspace, addMember, isLoading } = useWorkspaceStore();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const form = useForm<AddMembersForm>({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  const searchQuery = form.watch("searchQuery");

  // Debounced search
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await userApi.searchUsers(
          query,
          currentWorkspace?.id,
          10
        );

        // Filter out already selected users
        const selectedIds = new Set(selectedMembers.map((m) => m.user.id));
        const filtered = results.filter((u) => !selectedIds.has(u.id));

        setSearchResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    },
    [currentWorkspace?.id, selectedMembers]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSelectUser = (user: User) => {
    if (!selectedMembers.some((m) => m.user.id === user.id)) {
      setSelectedMembers([
        ...selectedMembers,
        { user, role: "VIEWER" as const },
      ]);
      form.setValue("searchQuery", "");
      setSearchResults([]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.user.id !== userId));
  };

  const handleRoleChange = (
    userId: string,
    role: "ADMIN" | "EDITOR" | "VIEWER"
  ) => {
    setSelectedMembers(
      selectedMembers.map((m) => (m.user.id === userId ? { ...m, role } : m))
    );
  };

  const onSubmit = async () => {
    if (!currentWorkspace) {
      toast.error("No workspace selected");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add each member
      for (const member of selectedMembers) {
        await addMember(currentWorkspace.id, member.user.id, member.role);
      }

      setSelectedMembers([]);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add members:", error);
      // Error toast is handled in the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDescriptions: Record<"ADMIN" | "EDITOR" | "VIEWER", string> = {
    ADMIN: "Admin",
    EDITOR: "Editor",
    VIEWER: "Viewer",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            join the workspace{" "}
            <span className="font-semibold text-foreground">
              {currentWorkspace?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by username or email"
                value={form.watch("searchQuery")}
                onChange={(e) => form.setValue("searchQuery", e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Search Results Dropdown */}
            {form.watch("searchQuery") && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                    >
                      <p className="font-medium text-sm">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim()
                          : user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Members List */}
          {selectedMembers.length > 0 && (
            <div className="rounded-lg p-4 px-0 space-y-3 max-h-48 overflow-y-auto">
              {selectedMembers.map(({ user, role }) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-1 bg-muted/50 rounded-lg pl-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${
                            user.lastName || ""
                          }`.trim()
                        : user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Select
                      value={role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          user.id,
                          value as "ADMIN" | "EDITOR" | "VIEWER"
                        )
                      }
                    >
                      <SelectTrigger className="w-28 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-md"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedMembers([]);
              form.reset();
            }}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isLoading || selectedMembers.length === 0}
          >
            {isSubmitting || isLoading
              ? "Adding..."
              : `Add ${selectedMembers.length} Member${
                  selectedMembers.length === 1 ? "" : "s"
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
