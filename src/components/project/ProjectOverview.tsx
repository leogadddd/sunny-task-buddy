import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Calendar, Target } from "lucide-react";

interface ProjectOverviewProps {
  projectId: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project } = useQuery({
    queryKey: ["project-overview", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(full_name),
          organization:organizations(name)
        `)
        .eq("id", projectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const { data: projectData } = await supabase
        .from("projects")
        .select("organization_id")
        .eq("id", projectId)
        .single();

      if (!projectData) return [];

      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          role,
          profile:profiles(full_name)
        `)
        .eq("organization_id", projectData.organization_id);

      if (error) throw error;
      return data;
    },
  });

  const { data: taskStats } = useQuery({
    queryKey: ["project-task-stats", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("status")
        .eq("project_id", projectId);

      if (error) throw error;

      const total = data.length;
      const completed = data.filter((t) => t.status === "done").length;
      const inProgress = data.filter((t) => t.status === "in_progress").length;

      return { total, completed, inProgress };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Project Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {((project?.owner as any)?.full_name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{(project?.owner as any)?.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">Project Owner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Tasks</span>
              <span className="font-semibold">{taskStats?.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span className="font-semibold text-success">{taskStats?.completed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>In Progress</span>
              <span className="font-semibold text-primary">{taskStats?.inProgress || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {members?.map((member, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {((member.profile as any)?.full_name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{(member.profile as any)?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
