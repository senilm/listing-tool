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
import { useGlobalSearchQuery } from "@/features/search/hooks/use-global-search-query";
import {
  type GlobalSearchResult,
  type SearchResultItem,
} from "@/features/search/services/search-service";
import { useDebounce } from "@/hooks/use-debounce";
import {
  dashboardRoute,
  ebayAccountDetailRoute,
  ebayAccountsRoute,
  productCreateRoute,
  productDetailRoute,
  productsRoute,
  publicationsRoute,
} from "@/lib/routes";

type QuickAction = {
  label: string;
  icon: LucideIcon;
  path: string;
  group: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Create Product",
    icon: Plus,
    path: productCreateRoute(),
    group: "Actions",
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: dashboardRoute(),
    group: "Navigate",
  },
  {
    label: "Products",
    icon: Package,
    path: productsRoute(),
    group: "Navigate",
  },
  {
    label: "eBay Accounts",
    icon: Store,
    path: ebayAccountsRoute(),
    group: "Navigate",
  },
  {
    label: "Publications",
    icon: Send,
    path: publicationsRoute(),
    group: "Navigate",
  },
];

const ACTION_GROUPS = ["Actions", "Navigate"];

type ResultGroup = {
  key: keyof GlobalSearchResult;
  heading: string;
  icon: LucideIcon;
  route: (item: SearchResultItem) => string;
};

const RESULT_GROUPS: ResultGroup[] = [
  {
    key: "products",
    heading: "Products",
    icon: Package,
    route: (item) => productDetailRoute(item.id),
  },
  {
    key: "accounts",
    heading: "eBay Accounts",
    icon: Store,
    route: (item) => ebayAccountDetailRoute(item.id),
  },
  {
    key: "publications",
    heading: "Publications",
    icon: Send,
    route: (item) =>
      `${publicationsRoute()}?s=${encodeURIComponent(item.title)}`,
  },
];

export const HeaderSearch = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const debouncedQuery = useDebounce(query);
  const { data: results, isFetching } = useGlobalSearchQuery(debouncedQuery);

  const isSearching =
    query.trim().length > 0 && (query !== debouncedQuery || isFetching);

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

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const handleSelect = (path: string) => {
    handleOpenChange(false);
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
        onOpenChange={handleOpenChange}
        title="Search"
        description="Search and navigate across the app"
      >
        <CommandInput
          placeholder="Search products, accounts, publications..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? "Searching…" : "No results found."}
          </CommandEmpty>

          {RESULT_GROUPS.map((group) => {
            const items = results?.[group.key] ?? [];
            if (items.length === 0) return null;
            return (
              <CommandGroup key={group.key} heading={group.heading}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${group.key}-${item.id}`}
                    keywords={[
                      item.title,
                      ...(item.subtitle ? [item.subtitle] : []),
                    ]}
                    onSelect={() => handleSelect(group.route(item))}
                  >
                    <group.icon />
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate">{item.title}</span>
                      {item.subtitle ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

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
