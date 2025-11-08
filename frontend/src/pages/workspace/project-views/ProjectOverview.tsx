import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLoading } from "@/hooks/useLoading";
import { projectApi } from "@/api/project.api";
import { Project as ProjectType } from "@/interfaces/project";
import { Workspace } from "@/interfaces/workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, CheckCircle2, Clock, TrendingUp, Users, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Mock data for demonstration
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

// Mock data for project overview sections
const todaysTasks = [
  { id: 1, title: "Review project proposal", priority: "high", dueTime: "2:00 PM" },
  { id: 2, title: "Update documentation", priority: "medium", dueTime: "4:00 PM" },
  { id: 3, title: "Client feedback call", priority: "high", dueTime: "5:00 PM" },
];

const recentActivity = [
  { id: 1, action: "Completed task", item: "Database optimization", time: "2 hours ago", user: "You" },
  { id: 2, action: "Created task", item: "Mobile App UI", time: "1 day ago", user: "Sarah" },
  { id: 3, action: "Updated deadline", item: "Q4 Report", time: "2 days ago", user: "Mike" },
  { id: 4, action: "Added comment", item: "Design review", time: "3 days ago", user: "You" },
];

const upcomingDeadlines = [
  { id: 1, title: "Website Launch", dueDate: "Nov 15", daysLeft: 7 },
  { id: 2, title: "Client Presentation", dueDate: "Nov 18", daysLeft: 10 },
  { id: 3, title: "API Documentation", dueDate: "Nov 20", daysLeft: 12 },
];

export default function ProjectOverview() {
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useLoading();
  const { isAuthenticated } = useAuth();
  const { currentWorkspace } = useWorkspaceStore();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.workspaceSlug || !params.projectSlug || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        // Fetch project by slug
        const proj = await projectApi.getProjectBySlug(
          params.workspaceSlug,
          params.projectSlug
        );

        if (proj) {
          setProject(proj);
          // Backend authorization already ensures user has access to this workspace/project
          setIsAuthorized(true);
        } else {
          setError("Project not found");
          toast.error("Project not found");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load project";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceSlug, params.projectSlug, isAuthenticated]);

  // Calculate project stats
  const projectStats = useMemo(() => {
    return {
      totalTasks: dummyStats.totalTasks,
      completedTasks: dummyStats.completedTasks,
      pendingTasks: dummyStats.pendingTasks,
      overdueTasks: dummyStats.overdueTasks,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Error Loading Project</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to view this project
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container py-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            {project.name}
          </h1>
          <p className="text-base text-muted-foreground">
            {project.description || "Project overview and key metrics"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button asChild>
            <Link to={`/${params.workspaceSlug}/${params.projectSlug}/tasks`}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All tasks in project</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
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
              <CardDescription>
                Your priority tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {task.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{task.dueTime}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link to={`/${params.workspaceSlug}/${params.projectSlug}/tasks`}>
                  View All Tasks
                </Link>
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
                Latest updates in this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg border bg-card">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {activity.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()}{' '}
                      <span className="font-medium">"{activity.item}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deadlines & Quick Actions */}
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
                <div key={deadline.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium text-sm">{deadline.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{deadline.dueDate}</p>
                    <Badge variant={deadline.daysLeft <= 7 ? 'destructive' : 'secondary'} className="text-xs">
                      {deadline.daysLeft}d left
                    </Badge>
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
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to={`/${params.workspaceSlug}/${params.projectSlug}/tasks`}>
                  <Plus className="mr-2 h-3 w-3" />
                  Create New Task
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to={`/${params.workspaceSlug}/${params.projectSlug}/kanban`}>
                  <BarChart3 className="mr-2 h-3 w-3" />
                  View Kanban Board
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to={`/${params.workspaceSlug}/${params.projectSlug}/calendar`}>
                  <Calendar className="mr-2 h-3 w-3" />
                  Project Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}