import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity } from "lucide-react";

interface ProjectActivityProps {
  projectId: string;
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const { data: activities } = useQuery({
    queryKey: ["project-activity", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activity")
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const getActivityMessage = (activity: any) => {
    switch (activity.action) {
      case "created_task":
        return `created task "${activity.details?.task_title}"`;
      case "completed_task":
        return `completed task "${activity.details?.task_title}"`;
      case "updated_tracker":
        return "updated the project tracker";
      default:
        return activity.action;
    }
  };

  return (
    <div className="space-y-4">
      {activities && activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {((activity.user as any)?.full_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{(activity.user as any)?.full_name}</span>{" "}
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No activity yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
