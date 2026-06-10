"use client";

import { HeaderBreadcrumb } from "@/components/layout/header-breadcrumb";
import { HeaderSearch } from "@/components/layout/header-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 md:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="my-auto h-5!" />
      <HeaderBreadcrumb />
      <div className="ml-auto flex items-center gap-2">
        <HeaderSearch />
        <ThemeToggle />
      </div>
    </header>
  );
};
