import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Workspace from "@/pages/workspace/Workspace";
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
    path: "/w/:slug",
    element: (
      <Layout>
        <Workspace />
      </Layout>
    ),
    protected: true,
  },

  // this should be the last route to catch all unmatched paths
  { path: "*", element: <NotFound />, protected: false },
];
