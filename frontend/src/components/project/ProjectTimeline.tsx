import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Circle } from "lucide-react";

interface ProjectTimelineProps {
  projectId: string;
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { data: tasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .not("start_date", "is", null)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: milestones } = useQuery({
    queryKey: ["milestones", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("target_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const allItems = [
    ...(tasks?.map((t) => ({ ...t, type: "task" as const })) || []),
    ...(milestones?.map((m) => ({ ...m, type: "milestone" as const })) || []),
  ].sort((a, b) => {
    const dateA = a.type === "task" ? a.start_date : a.target_date;
    const dateB = b.type === "task" ? b.start_date : b.target_date;
    return new Date(dateA!).getTime() - new Date(dateB!).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-8">
          {allItems.map((item, index) => (
            <div key={`${item.type}-${item.id}`} className="relative pl-12">
              <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {item.type === "milestone" ? (
                  <Flag className="w-4 h-4 text-primary" />
                ) : (
                  <Circle className="w-3 h-3 text-primary" />
                )}
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {item.type === "task" ? item.title : item.title}
                        </h4>
                        {item.type === "milestone" && (
                          <Badge variant="outline">Milestone</Badge>
                        )}
                        {item.type === "task" && (
                          <Badge variant={item.status === "done" ? "outline" : "default"}>
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.type === "task" ? (
                          <>
                            {item.start_date && `Start: ${new Date(item.start_date).toLocaleDateString()}`}
                            {item.due_date && ` → Due: ${new Date(item.due_date).toLocaleDateString()}`}
                          </>
                        ) : (
                          `Target: ${new Date(item.target_date).toLocaleDateString()}`
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {allItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No timeline items yet. Create tasks or milestones to see them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
