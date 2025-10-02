import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data: orgs } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id);

      if (!orgs || orgs.length === 0) {
        return { total: 0, completed: 0, inProgress: 0, overdue: 0 };
      }

      const orgIds = orgs.map((o) => o.organization_id);

      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .in("organization_id", orgIds);

      if (!projects || projects.length === 0) {
        return { total: 0, completed: 0, inProgress: 0, overdue: 0 };
      }

      const projectIds = projects.map((p) => p.id);

      const { data: allTasks } = await supabase
        .from("tasks")
        .select("status, due_date")
        .in("project_id", projectIds);

      const tasks = allTasks || [];
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "done").length;
      const inProgress = tasks.filter((t) => t.status === "in_progress").length;
      const overdue = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
      ).length;

      return { total, completed, inProgress, overdue };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats?.total || 0,
      icon: TrendingUp,
      description: "Across all projects",
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      icon: CheckCircle2,
      description: "Tasks finished",
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      icon: Clock,
      description: "Active tasks",
    },
    {
      title: "Overdue",
      value: stats?.overdue || 0,
      icon: AlertCircle,
      description: "Need attention",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
