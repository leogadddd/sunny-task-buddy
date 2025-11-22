import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Folder,
  Bell,
  Star,
  ArrowRight,
} from "lucide-react";
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
import { useProjectStore } from "@/stores/project.store";
import { WorkspaceDialog } from "@/components/dialogs/WorkspaceDialog";
import { useState, useEffect, useMemo } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy data for demonstration
const dummyStats = {
  totalTasks: 24,
  completedTasks: 18,
  pendingTasks: 6,
  overdueTasks: 2,
};

const dummyChartData = [
  { day: "Mon", completed: 4 },
  { day: "Tue", completed: 6 },
  { day: "Wed", completed: 3 },
  { day: "Thu", completed: 8 },
  { day: "Fri", completed: 7 },
  { day: "Sat", completed: 2 },
  { day: "Sun", completed: 1 },
];

const chartConfig = {
  completed: {
    label: "Completed Tasks",
    color: "#f1594a",
  },
};

// Mock data for dashboard sections
const todaysTasks = [
  {
    id: 1,
    title: "Review project proposal",
    project: "Marketing Campaign",
    priority: "high",
    dueTime: "2:00 PM",
  },
  {
    id: 2,
    title: "Update team documentation",
    project: "Product Launch",
    priority: "medium",
    dueTime: "4:00 PM",
  },
  {
    id: 3,
    title: "Client feedback call",
    project: "Website Redesign",
    priority: "high",
    dueTime: "5:00 PM",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Completed task",
    item: "Database optimization",
    project: "Backend API",
    time: "2 hours ago",
    user: "John Doe",
  },
  {
    id: 2,
    action: "Created project",
    item: "Mobile App UI",
    project: "Mobile Development",
    time: "4 hours ago",
    user: "Jane Smith",
  },
  {
    id: 3,
    action: "Updated task",
    item: "User authentication",
    project: "Frontend",
    time: "6 hours ago",
    user: "Bob Johnson",
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Website Launch",
    project: "E-commerce Site",
    dueDate: "Nov 15",
    daysLeft: 7,
  },
  {
    id: 2,
    title: "Client Presentation",
    project: "Marketing Campaign",
    dueDate: "Nov 18",
    daysLeft: 10,
  },
  {
    id: 3,
    title: "API Documentation",
    project: "Backend Services",
    dueDate: "Nov 20",
    daysLeft: 12,
  },
];

const newsUpdates = [
  {
    id: 1,
    title: "New Feature: Advanced Analytics",
    description:
      "Track project performance with detailed insights and reports.",
    date: "Nov 5",
    type: "feature",
  },
  {
    id: 2,
    title: "System Maintenance",
    description: "Scheduled maintenance on Nov 12, 2-4 AM EST.",
    date: "Nov 3",
    type: "maintenance",
  },
  {
    id: 3,
    title: "Team Collaboration Update",
    description: "Improved real-time collaboration features now available.",
    date: "Nov 1",
    type: "update",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces } = useWorkspaceStore();
  const { projects } = useProjectStore();

  const [isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen] =
    useState(false);

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    return {
      totalWorkspaces: workspaces.length,
      totalProjects: projects.length,
      pendingTasks: dummyStats.pendingTasks,
      completedTasks: dummyStats.completedTasks,
    };
  }, [workspaces, projects]);

  if (!user) return null;

  return (
    <>
      <div className="space-y-6 container py-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.firstName || user.email}!
            </h1>
            <p className="text-base text-muted-foreground">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {workspaces.length > 0 && (
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
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            {workspaces.length === 0 && (
              <Button onClick={() => setIsCreateWorkspaceDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Workspaces"
            value={dashboardStats.totalWorkspaces}
            description="Active workspaces"
            icon={Folder}
            iconColor="text-blue-500"
          />
          <DashboardCard
            title="Projects"
            value={dashboardStats.totalProjects}
            description="Total projects"
            icon={CheckCircle2}
            iconColor="text-green-500"
          />
          <DashboardCard
            title="Active Tasks"
            value={dashboardStats.pendingTasks}
            description="Tasks in progress"
            icon={Clock}
            iconColor="text-orange-500"
          />
          <DashboardCard
            title="Completed"
            value={dashboardStats.completedTasks}
            description="Tasks this week"
            icon={TrendingUp}
            iconColor="text-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>Your priority tasks for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.project}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          task.priority === "high" ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.dueTime}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  View All Tasks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your workspaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg border bg-card"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action.toLowerCase()}{" "}
                        <span className="font-medium">"{activity.item}"</span>
                        {activity.project && (
                          <span className="text-muted-foreground">
                            {" "}
                            in {activity.project}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Weekly Progress</CardTitle>
                <CardDescription>
                  Tasks completed over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dummyChartData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="completed"
                        fill="var(--color-completed)"
                        radius={4}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deadlines & News */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-4 w-4" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.project}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{deadline.dueDate}</p>
                      <Badge
                        variant={
                          deadline.daysLeft <= 7 ? "destructive" : "secondary"
                        }
                      >
                        {deadline.daysLeft}d left
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* News & Updates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-4 w-4" />
                  News & Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {newsUpdates.map((news) => (
                  <div
                    key={news.id}
                    className="p-2.5 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{news.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {news.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {news.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Create New Project
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Users className="mr-2 h-3 w-3" />
                  Invite Team Member
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
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
