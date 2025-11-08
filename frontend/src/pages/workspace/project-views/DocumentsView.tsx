import React from "react";
import { useParams } from "react-router-dom";

export default function DocumentsView() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Manage project documents and files
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Documents View</h2>
        <p className="text-center text-muted-foreground">
          Documents view coming soon! This will show project files and
          documents.
        </p>
      </div>
    </div>
  );
}
