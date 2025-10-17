import React from "react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth/client";

export function MenuPopover() {
  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-center gap-1 rounded hover:bg-secondary-foreground/10 p-0.5 px-1 transition-colors">
          <Menu className="w-4 h-4" /> <span className="text-xs mt-1"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 mt-2" align="end" side="bottom">
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="xs"
            className="justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
