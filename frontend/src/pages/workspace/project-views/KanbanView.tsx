import React from "react";
import { useParams } from "react-router-dom";

export default function KanbanView() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">
          Visualize your tasks in a kanban board
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Kanban View</h2>
        <p className="text-center text-muted-foreground">
          Kanban board coming soon! This will show tasks organized by status.
        </p>
      </div>
    </div>
  );
}
