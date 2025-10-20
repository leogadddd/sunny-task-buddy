import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/apollo/queries";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { apolloClient } from "@/lib/apollo/client";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // GraphQL Mutations
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated && !authLoading) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, authLoading, navigate, redirectTo]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registerPromise = registerMutation({
        variables: {
          email,
          password,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
        },
      });

      toast.promise(registerPromise, {
        loading: "Creating your account...",
        success: "Account created successfully!",
        error: "Failed to create account",
      });

      const { data } = await registerPromise;

      const result = data?.register;

      if (!result?.success) {
        toast.error(result?.message || "Failed to create account", {
          description: result?.errors?.join(", "),
        });
        return;
      }

      // Clear form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");

      // Auto-login immediately after registration by awaiting the login mutation
      try {
        const loginPromise = loginMutation({
          variables: { email, password },
        });

        toast.promise(loginPromise, {
          loading: "Logging you in...",
          success: "Logged in successfully!",
          error: "Auto-login failed after registration",
        });

        const { data: loginData } = await loginPromise;

        const loginResult = loginData?.login;

        if (!loginResult?.success) {
          toast.error(
            loginResult?.message || "Auto-login failed after registration"
          );
          return;
        }

        // Server will set HttpOnly session cookie. Clear client cache so authenticated queries refetch.
        try {
          await apolloClient.clearStore();
        } catch (e) {
          console.warn("Failed to reset Apollo cache after login", e);
        }

        // toast.success(loginResult.message || "Welcome!");
        navigate(redirectTo);
        return;
      } catch (err: unknown) {
        console.error("Auto-login failed", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        const displayMessage =
          errorMessage === "Failed to fetch"
            ? "Authentication Failed"
            : errorMessage;
        toast.error("Auto-login failed", {
          description: displayMessage,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const displayMessage =
        errorMessage === "Failed to fetch"
          ? "Authentication Failed"
          : errorMessage;
      toast.error("Failed to create account", {
        description: displayMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    // If called from a form submit, prevent default. When called programmatically
    // (e.g. after signup) we won't have an event.
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await loginMutation({
        variables: {
          email,
          password,
        },
      });

      const result = data?.login;

      if (!result?.success) {
        toast.error(result?.message || "Failed to sign in", {
          description: result?.errors?.join(", "),
        });
        return;
      }

      // Server sets HttpOnly cookie for session. Reset Apollo cache so authenticated queries refetch
      try {
        await apolloClient.clearStore();
      } catch (e) {
        console.warn("Failed to reset Apollo cache after login", e);
      }

      toast.success(result.message || "Welcome back!");

      // Navigate to dashboard
      navigate(redirectTo);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const displayMessage =
        errorMessage === "Failed to fetch"
          ? "Authentication Failed"
          : errorMessage;
      toast.error("Failed to sign in", {
        description: displayMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Sunny Task Buddy
            </CardTitle>
            <CardDescription className="text-center">
              Collaborate, track, and celebrate your team's wins 🎉
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters long
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
