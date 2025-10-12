import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth/client";
import appConfig from "@/config/app-config";
import { Layout } from "@/components/layout/Layout";

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
    <Layout>
      <div className="min-h-screen bg-background">life</div>
    </Layout>
  );
}
