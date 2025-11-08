import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import WorkspaceOverview from "@/pages/workspace/WorkspaceOverview";
import WorkspaceProjects from "@/pages/workspace/WorkspaceProjects";
import WorkspaceMembers from "@/pages/workspace/WorkspaceMembers";
import WorkspaceCalendar from "@/pages/workspace/WorkspaceCalendar";
import WorkspaceAnalytics from "@/pages/workspace/WorkspaceAnalytics";
import WorkspaceArchive from "@/pages/workspace/WorkspaceArchive";
import WorkspaceSettings from "@/pages/workspace/WorkspaceSettings";
import KanbanView from "@/pages/workspace/project-views/KanbanView";
import GanttView from "@/pages/workspace/project-views/GanttView";
import CalendarView from "@/pages/workspace/project-views/CalendarView";
import DocumentsView from "@/pages/workspace/project-views/DocumentsView";
import ProjectSettingsView from "@/pages/workspace/project-views/ProjectSettingsView";
import ProjectOverview from "@/pages/workspace/project-views/ProjectOverview";
import Project from "@/pages/workspace/Project";
import { Layout } from "@/components/layout/Layout";

// Define routes as an array of objects for easy addition
export const routes = [
  { path: "/", element: <Index />, protected: false },
  { path: "/auth", element: <Auth />, protected: false },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug",
    element: (
      <Layout>
        <WorkspaceOverview />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/projects",
    element: (
      <Layout>
        <WorkspaceProjects />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/members",
    element: (
      <Layout>
        <WorkspaceMembers />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/calendar",
    element: (
      <Layout>
        <WorkspaceCalendar />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/analytics",
    element: (
      <Layout>
        <WorkspaceAnalytics />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/archive",
    element: (
      <Layout>
        <WorkspaceArchive />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/settings",
    element: (
      <Layout>
        <WorkspaceSettings />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug",
    element: (
      <Layout>
        <ProjectOverview />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/tasks",
    element: (
      <Layout>
        <Project />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/kanban",
    element: (
      <Layout>
        <KanbanView />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/gantt",
    element: (
      <Layout>
        <GanttView />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/calendar",
    element: (
      <Layout>
        <CalendarView />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/documents",
    element: (
      <Layout>
        <DocumentsView />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/:workspaceSlug/:projectSlug/settings",
    element: (
      <Layout>
        <ProjectSettingsView />
      </Layout>
    ),
    protected: true,
  },

  // this should be the last route to catch all unmatched paths
  { path: "*", element: <NotFound />, protected: false },
];
