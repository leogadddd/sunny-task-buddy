import React from "react";
import { useParams } from "react-router-dom";

export default function WorkspaceArchive() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Archive</h1>
        <p className="text-muted-foreground">
          View archived projects and completed work
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Archived Items</h2>
        <p className="text-center text-muted-foreground">
          Archive view coming soon! This will show all archived projects and
          tasks.
        </p>
      </div>
    </div>
  );
}
