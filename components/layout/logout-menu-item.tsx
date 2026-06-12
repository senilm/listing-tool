"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import { loginRoute } from "@/lib/routes";
import { toErrorMessage, toast } from "@/lib/toast";

type LogoutMenuItemProps = {
  onLoggedOut?: () => void;
};

export const LogoutMenuItem = ({ onLoggedOut }: LogoutMenuItemProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      onLoggedOut?.();
      router.push(loginRoute());
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error));
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenuItem
      variant="destructive"
      onSelect={() => void handleLogout()}
      disabled={isLoggingOut}
    >
      <LogOut />
      Logout
    </DropdownMenuItem>
  );
};
