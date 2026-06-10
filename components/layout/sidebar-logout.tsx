"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { loginRoute } from "@/lib/routes";
import { toErrorMessage, toast } from "@/lib/toast";

export const SidebarLogout = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push(loginRoute());
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error));
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarMenuButton
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      tooltip="Logout"
    >
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
};
