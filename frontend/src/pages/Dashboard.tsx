import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-bold">Sunny Task Buddy</h1>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name || user?.email}!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Add your content here */}
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Your dashboard is ready. Start building!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
