import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProjectTimeline } from "@/components/project/ProjectTimeline";
import { ProjectTasks } from "@/components/project/ProjectTasks";
import { ProjectTracker } from "@/components/project/ProjectTracker";
import { ProjectActivity } from "@/components/project/ProjectActivity";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) throw new Error("No project ID");
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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

  if (!user || !id) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{project?.name || "Loading..."}</h1>
            <p className="text-muted-foreground">{project?.description || ""}</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="tracker">Tracker</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <ProjectOverview projectId={id} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <ProjectTimeline projectId={id} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <ProjectTasks projectId={id} />
            </TabsContent>

            <TabsContent value="tracker" className="space-y-4">
              <ProjectTracker projectId={id} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <ProjectActivity projectId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
