import React from "react";
import { useParams } from "react-router-dom";

export default function ProjectSettingsView() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">
          Configure project settings and preferences
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Project Settings</h2>
        <p className="text-center text-muted-foreground">
          Project settings coming soon! This will allow configuring project
          details.
        </p>
      </div>
    </div>
  );
}
