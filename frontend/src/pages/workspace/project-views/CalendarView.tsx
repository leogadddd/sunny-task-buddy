import React from "react";
import { useParams } from "react-router-dom";

export default function CalendarView() {
  const params = useParams();

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View tasks by date and schedule</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Calendar View</h2>
        <p className="text-center text-muted-foreground">
          Calendar view coming soon! This will show tasks organized by dates.
        </p>
      </div>
    </div>
  );
}
