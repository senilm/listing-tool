"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { dashboardRoute } from "@/lib/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navConfig } from "@/components/layout/nav-config";
import { SidebarLogout } from "@/components/layout/sidebar-logout";
import { SidebarUser } from "@/components/layout/sidebar-user";

const isItemActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={APP_NAME}>
              <Link href={dashboardRoute()}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Gem className="size-4" />
                </div>
                <span className="truncate text-base font-semibold">
                  {APP_NAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navConfig.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(pathname, item.path)}
                      tooltip={item.label}
                    >
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarUser />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLogout />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
