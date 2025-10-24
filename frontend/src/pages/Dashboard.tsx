import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { apolloClient } from "@/lib/apollo/client";
import { LOGOUT_MUTATION } from "@/lib/apollo/queries";
import appConfig from "@/config/app.config";
import { Layout } from "@/components/layout/Layout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceDialog } from "@/components/dialogs/WorkspaceDialog";
import { useState } from "react";

// Dummy data
const dummyStats = {
  totalTasks: 12,
  completedTasks: 8,
  pendingTasks: 4,
};

const dummyChartData = [
  { day: "Mon", completed: 2 },
  { day: "Tue", completed: 3 },
  { day: "Wed", completed: 1 },
  { day: "Thu", completed: 4 },
  { day: "Fri", completed: 5 },
  { day: "Sat", completed: 2 },
  { day: "Sun", completed: 1 },
];

const chartConfig = {
  completed: {
    label: "Completed Tasks",
    color: "#f1594a",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces } = useWorkspaceStore();

  const [isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen] =
    useState(false);

  if (!user) return null;

  return (
    <>
      <div className="space-y-6 container py-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.firstName || user.email}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Ready to tackle your tasks? Let's get started.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-end space-x-2">
              {workspaces.length > 0 && ( // Show logout only if user belongs to any workspace
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    try {
                      await apolloClient.mutate({ mutation: LOGOUT_MUTATION });
                      await apolloClient.clearStore();
                      window.location.href = appConfig.auth.logoutRedirectUrl;
                    } catch (e) {
                      console.error("Logout failed", e);
                      toast.error("Logout failed");
                    }
                  }}
                >
                  <LogOut />
                </Button>
              )}
              {workspaces.length === 0 && ( // Prompt to create workspace if none exist
                <Button onClick={() => setIsCreateWorkspaceDialogOpen(true)}>
                  <Plus className="mr-1" />
                  Create Workspace
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <WorkspaceDialog
        open={isCreateWorkspaceDialogOpen}
        onOpenChange={setIsCreateWorkspaceDialogOpen}
        workspace={null}
      />
    </>
  );
}
