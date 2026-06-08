"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { homeRoute } from "@/lib/routes";
import { toErrorMessage, toast } from "@/lib/toast";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export const SidebarLogout = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push(homeRoute());
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error));
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarMenuButton
      onClick={handleLogout}
      disabled={isLoggingOut}
      tooltip="Logout"
    >
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
};
