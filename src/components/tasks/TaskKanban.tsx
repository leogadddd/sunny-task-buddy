import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useEffect } from "react";

interface TaskKanbanProps {
  projectId: string;
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "in_progress", title: "In Progress", color: "bg-primary/10" },
  { id: "done", title: "Done", color: "bg-success/10" },
];

export function TaskKanban({ projectId }: TaskKanbanProps) {
  const queryClient = useQueryClient();
  
  const { data: tasks } = useQuery({
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

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const handleStatusChange = async (taskId: string, newStatus: string, taskTitle: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus as "todo" | "in_progress" | "done",
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
      toast.success(`🎉 Great job! "${taskTitle}" completed!`);
    }

    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="space-y-3">
          <div className={`rounded-lg p-3 ${column.color}`}>
            <h3 className="font-semibold">{column.title}</h3>
            <p className="text-sm text-muted-foreground">
              {tasks?.filter((t) => t.status === column.id).length || 0} tasks
            </p>
          </div>

          <div className="space-y-3">
            {tasks
              ?.filter((task) => task.status === column.id)
              .map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-1 pt-2">
                        {columns.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => handleStatusChange(task.id, col.id, task.title)}
                            className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                              task.status === col.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-accent"
                            }`}
                          >
                            {col.title}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
