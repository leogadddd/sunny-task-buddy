import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const { data: tasks, refetch } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles(full_name)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleToggleComplete = async (taskId: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    
    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
      return;
    }

    if (newStatus === "done") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`🎉 "${title}" completed!`);
    }

    refetch();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge variant="outline" className="bg-success/10">Done</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-primary/10">In Progress</Badge>;
      default:
        return <Badge variant="outline">To Do</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      {tasks?.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={() => handleToggleComplete(task.id, task.status, task.title)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h4>
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {task.priority}
                </Badge>
                {getStatusBadge(task.status)}
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.assignee && (
                  <span>Assigned to: {(task.assignee as any).full_name}</span>
                )}
                {task.due_date && (
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {(!tasks || tasks.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  );
}
