"use client";

import { ChevronsUpDown, Settings } from "lucide-react";
import Link from "next/link";

import { LogoutMenuItem } from "@/components/layout/logout-menu-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { getInitials } from "@/lib/format";
import { settingsRoute } from "@/lib/routes";

export const SidebarUser = () => {
  const { data: session, isPending } = authClient.useSession();
  const { isMobile } = useSidebar();

  if (isPending) return <SidebarMenuSkeleton showIcon />;
  if (!session?.user) return null;

  const { name, email, image } = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          tooltip={name}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-7 rounded-md">
            {!!image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback className="rounded-md text-xs font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="grid text-left text-sm leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={settingsRoute()}>
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
