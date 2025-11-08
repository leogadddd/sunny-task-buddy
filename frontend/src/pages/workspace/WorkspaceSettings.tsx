import React from "react";
import { useParams } from "react-router-dom";

export default function WorkspaceSettings() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground">
          Configure workspace preferences and settings
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <p className="text-center text-muted-foreground">
          Workspace settings coming soon! This will allow configuring workspace
          preferences.
        </p>
      </div>
    </div>
  );
}
