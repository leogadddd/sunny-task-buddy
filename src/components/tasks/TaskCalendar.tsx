import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

interface TaskCalendarProps {
  projectId: string;
}

export function TaskCalendar({ projectId }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: tasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .not("due_date", "is", null)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const tasksForSelectedDate = tasks?.filter((task) => {
    if (!task.due_date || !selectedDate) return false;
    const taskDate = new Date(task.due_date);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });

  const datesWithTasks = tasks?.map((task) => new Date(task.due_date!)) || [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasTask: datesWithTasks,
            }}
            modifiersStyles={{
              hasTask: {
                fontWeight: "bold",
                textDecoration: "underline",
              },
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">
          Tasks for {selectedDate?.toLocaleDateString() || "Selected Date"}
        </h3>
        {tasksForSelectedDate && tasksForSelectedDate.length > 0 ? (
          <div className="space-y-2">
            {tasksForSelectedDate.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={task.status === "done" ? "outline" : "default"}>
                      {task.status}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No tasks for this date</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
