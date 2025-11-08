import React from "react";
import { useParams } from "react-router-dom";

export default function GanttView() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Gantt Chart</h1>
        <p className="text-muted-foreground">
          Track project timeline and dependencies
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Gantt Chart View</h2>
        <p className="text-center text-muted-foreground">
          Gantt chart coming soon! This will show task timelines and
          dependencies.
        </p>
      </div>
    </div>
  );
}
