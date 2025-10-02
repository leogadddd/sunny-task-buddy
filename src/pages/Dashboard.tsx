import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { OrganizationList } from "@/components/OrganizationList";
import { DashboardStats } from "@/components/DashboardStats";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateOrgOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Organization
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <DashboardStats />
          <OrganizationList />

          <CreateOrganizationDialog
            open={isCreateOrgOpen}
            onOpenChange={setIsCreateOrgOpen}
          />
        </div>
      </div>
    </div>
  );
}
