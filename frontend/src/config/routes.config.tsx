import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Workspace from "@/pages/workspace/Workspace";
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
    path: "/w/:workspaceSlug",
    element: (
      <Layout>
        <Workspace />
      </Layout>
    ),
    protected: true,
  },
  {
    path: "/w/:workspaceSlug/p/:projectSlug",
    element: (
      <Layout>
        <Project />
      </Layout>
    ),
    protected: true,
  },

  // this should be the last route to catch all unmatched paths
  { path: "*", element: <NotFound />, protected: false },
];
