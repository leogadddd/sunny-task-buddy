import React from "react";
import { useParams } from "react-router-dom";

export default function WorkspaceAnalytics() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track workspace performance and insights
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Workspace Analytics</h2>
        <p className="text-center text-muted-foreground">
          Analytics dashboard coming soon! This will show workspace statistics
          and reports.
        </p>
      </div>
    </div>
  );
}
