import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@/styles/WorkspaceCalendar.css";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Custom event content component
function renderEventContent(eventInfo) {
  const isAllDay = eventInfo.event.allDay;
  const timeText = eventInfo.timeText;

  return (
    <div className="flex flex-col p-1 min-h-0">
      {!isAllDay && timeText && (
        <div className="text-[10px] opacity-75 leading-tight mb-0.5">
          {timeText}
        </div>
      )}
      <div className="font-medium text-xs truncate leading-tight">
        {eventInfo.event.title}
      </div>
      {eventInfo.event.extendedProps.project && (
        <div className="text-[10px] opacity-80 mt-0.5 truncate">
          {eventInfo.event.extendedProps.project}
        </div>
      )}
    </div>
  );
}

export default function WorkspaceCalendar() {
  const params = useParams();
  const { currentWorkspace } = useWorkspaceStore();
  const { projects } = useProjectStore();

  // Generate events from projects and tasks
  const events = useMemo(() => {
    const calendarEvents = [];

    // Add project deadlines as events (some as all-day, some with specific times)
    projects.forEach((project, index) => {
      if (project.endDate) {
        // Alternate between all-day and time-specific events for demonstration
        const isTimeSpecific = index % 2 === 0; // Every other project gets a specific time

        if (isTimeSpecific) {
          // Create a time-specific deadline event (e.g., 5 PM on deadline day)
          const deadlineDate = new Date(project.endDate);
          const startTime = new Date(deadlineDate);
          startTime.setHours(17, 0, 0, 0); // 5:00 PM
          const endTime = new Date(deadlineDate);
          endTime.setHours(18, 0, 0, 0); // 6:00 PM

          calendarEvents.push({
            id: `project-${project.id}`,
            title: `${project.name} - Deadline Review`,
            start: startTime,
            end: endTime,
            allDay: false,
            backgroundColor: project.color || "#f1594a",
            borderColor: project.color || "#f1594a",
            extendedProps: {
              type: "project",
              project: project.name,
            },
          });
        } else {
          // Keep some as all-day events
          calendarEvents.push({
            id: `project-${project.id}`,
            title: `${project.name} - Deadline`,
            start: new Date(project.endDate),
            end: new Date(project.endDate),
            allDay: true,
            backgroundColor: project.color || "#f1594a",
            borderColor: project.color || "#f1594a",
            extendedProps: {
              type: "project",
              project: project.name,
            },
          });
        }
      }

      // Add project start dates with specific times
      if (project.startDate) {
        const startDate = new Date(project.startDate);
        const startTime = new Date(startDate);
        startTime.setHours(9, 0, 0, 0); // 9:00 AM
        const endTime = new Date(startDate);
        endTime.setHours(10, 30, 0, 0); // 10:30 AM

        calendarEvents.push({
          id: `project-start-${project.id}`,
          title: `${project.name} - Kickoff Meeting`,
          start: startTime,
          end: endTime,
          allDay: false,
          backgroundColor: project.color || "#f1594a",
          borderColor: project.color || "#f1594a",
          extendedProps: {
            type: "project-start",
            project: project.name,
          },
        });
      }
    });

    // Add sample time-based events to demonstrate block display
    const sampleEvents = [
      {
        id: "sample-1",
        title: "Team Standup",
        start: new Date(2025, 10, 10, 9, 0), // November 10, 2025, 9:00 AM
        end: new Date(2025, 10, 10, 9, 30), // 9:30 AM
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
        extendedProps: {
          type: "meeting",
          project: "General",
        },
      },
      {
        id: "sample-2",
        title: "Sprint Review",
        start: new Date(2025, 10, 15, 14, 0), // November 15, 2025, 2:00 PM
        end: new Date(2025, 10, 15, 15, 30), // 3:30 PM
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        extendedProps: {
          type: "meeting",
          project: "General",
        },
      },
      {
        id: "sample-3",
        title: "Client Presentation",
        start: new Date(2025, 10, 12, 11, 0), // November 12, 2025, 11:00 AM
        end: new Date(2025, 10, 12, 12, 30), // 12:30 PM
        backgroundColor: "#8b5cf6",
        borderColor: "#8b5cf6",
        extendedProps: {
          type: "meeting",
          project: "Client Project",
        },
      },
    ];

    return [...calendarEvents, ...sampleEvents];
  }, [projects]);

  return (
    <div className="container space-y-6 mx-auto py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View all workspace events and deadlines
          </p>
        </div>

        <Button className="flex items-center">
          <Plus className="mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{events.length}</div>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {events.filter((e) => e.extendedProps?.type === "project").length}
          </div>
          <p className="text-sm text-muted-foreground">Project Deadlines</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {events.filter((e) => e.extendedProps?.type === "meeting").length}
          </div>
          <p className="text-sm text-muted-foreground">Meetings</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div style={{ height: "600px" }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "today,dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            events={events}
            eventContent={renderEventContent}
            height="100%"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            eventMouseEnter={(info) => {
              info.el.style.opacity = "0.8";
            }}
            eventMouseLeave={(info) => {
              info.el.style.opacity = "1";
            }}
          />
        </div>
      </div>
    </div>
  );
}
