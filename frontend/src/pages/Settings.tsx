import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Link2, Unlink, Mail, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [accountToUnlink, setAccountToUnlink] = useState<any>(null);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      // Fetch user's linked accounts from Better Auth
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/list-accounts`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Failed to fetch linked accounts:", error);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/settings",
      });
      toast.success("Successfully linked Google account");
      fetchLinkedAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to link Google account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!accountToUnlink) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/unlink-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            providerId: accountToUnlink.providerId,
          }),
        }
      );

      if (response.ok) {
        toast.success("Account unlinked successfully");
        fetchLinkedAccounts();
      } else {
        throw new Error("Failed to unlink account");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to unlink account");
    } finally {
      setIsLoading(false);
      setShowUnlinkDialog(false);
      setAccountToUnlink(null);
    }
  };

  const isGoogleLinked = accounts.some((acc) => acc.providerId === "google");
  const hasPasswordAccount = accounts.some(
    (acc) => acc.providerId === "credential"
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your authentication methods and account security
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-lg">{user?.name || "Not set"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{user?.email}</p>
                    {user?.emailVerified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Linked Accounts
                </CardTitle>
                <CardDescription>
                  Connect external accounts to sign in with multiple methods.
                  For security, you cannot automatically link accounts with the
                  same email - you must manually link them here while logged in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email/Password Account */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email & Password</p>
                      <p className="text-sm text-muted-foreground">
                        {hasPasswordAccount
                          ? "Sign in with your email and password"
                          : "No password set"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={hasPasswordAccount ? "default" : "secondary"}>
                    {hasPasswordAccount ? "Active" : "Not Set"}
                  </Badge>
                </div>

                {/* Google Account */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-sm text-muted-foreground">
                        {isGoogleLinked
                          ? "Sign in with your Google account"
                          : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {isGoogleLinked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const googleAccount = accounts.find(
                          (acc) => acc.providerId === "google"
                        );
                        setAccountToUnlink(googleAccount);
                        setShowUnlinkDialog(true);
                      }}
                      disabled={isLoading}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Unlink
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLinkGoogle}
                      disabled={isLoading}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Link Account
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Security Note:</strong> Linking accounts allows you
                    to sign in using different methods, but they must be
                    manually connected for security. If you try to sign in with
                    Google using an email that already has a password account,
                    you'll be prompted to sign in first and link from here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this account? You will no longer
              be able to sign in using this method. Make sure you have another
              way to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlinkAccount}>
              Unlink Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
