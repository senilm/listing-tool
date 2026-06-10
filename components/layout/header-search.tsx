"use client";

import {
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Send,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  dashboardRoute,
  ebayAccountsRoute,
  productCreateRoute,
  productsRoute,
  publicationsRoute,
} from "@/lib/routes";

type QuickAction = {
  label: string;
  icon: LucideIcon;
  path: string;
  group: string;
};

// Stubbed search: quick navigation only. Live cross-module results land here
// once a search service exists.
const QUICK_ACTIONS: QuickAction[] = [
  { label: "Create Product", icon: Plus, path: productCreateRoute(), group: "Actions" },
  { label: "Dashboard", icon: LayoutDashboard, path: dashboardRoute(), group: "Navigate" },
  { label: "Products", icon: Package, path: productsRoute(), group: "Navigate" },
  { label: "eBay Accounts", icon: Store, path: ebayAccountsRoute(), group: "Navigate" },
  { label: "Publications", icon: Send, path: publicationsRoute(), group: "Navigate" },
];

const ACTION_GROUPS = ["Actions", "Navigate"];

export const HeaderSearch = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent/50"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search and navigate across the app"
      >
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {ACTION_GROUPS.map((group) => (
            <CommandGroup key={group} heading={group}>
              {QUICK_ACTIONS.filter((action) => action.group === group).map(
                (action) => (
                  <CommandItem
                    key={action.path}
                    value={action.label}
                    onSelect={() => handleSelect(action.path)}
                  >
                    <action.icon />
                    <span>{action.label}</span>
                  </CommandItem>
                ),
              )}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
