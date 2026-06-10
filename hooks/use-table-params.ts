import {
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_LIMIT = 20;
const DEBOUNCE_DELAY = 300;
const MULTI_VALUE_SEPARATOR = ",";

type UseTableParamsConfig = {
  // Filter ids that live in the URL (each a multi-select column). Pass a stable
  // (module-level) array.
  filterKeys?: string[];
  defaultLimit?: number;
  debounceDelay?: number;
};

// The URL is the single source of truth for list state — pagination, sorting,
// filters and search all live in the query string (shareable, back/forward
// works, survives refresh). Returns values + handlers shaped for <DataTable />,
// plus `apiParams` (a query string) to feed a React Query key/fetcher.
export const useTableParams = ({
  filterKeys = [],
  defaultLimit = DEFAULT_LIMIT,
  debounceDelay = DEBOUNCE_DELAY,
}: UseTableParamsConfig = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // --- Search (local input, debounced into the URL) ---
  const urlSearch = searchParams.get("s") ?? "";
  const [search, setSearch] = useState(urlSearch);

  // Sync the input when the URL changes externally (back/forward, cleared
  // filters) using React's adjust-state-during-render pattern — no effect.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed === urlSearch) return;
      updateParams((params) => {
        if (trimmed) params.set("s", trimmed);
        else params.delete("s");
        params.set("page", "1");
      });
    }, debounceDelay);
    return () => clearTimeout(timer);
  }, [search, urlSearch, debounceDelay, updateParams]);

  // --- Pagination ---
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || defaultLimit;

  const onPageChange = useCallback(
    (value: number) =>
      updateParams((params) => {
        if (value <= 1) params.delete("page");
        else params.set("page", String(value));
      }),
    [updateParams],
  );

  const onLimitChange = useCallback(
    (value: number) =>
      updateParams((params) => {
        params.set("limit", String(value));
        params.set("page", "1");
      }),
    [updateParams],
  );

  // --- Sorting ---
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const sorting = useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  const onSortingChange = useCallback(
    (next: SortingState) =>
      updateParams((params) => {
        const [sort] = next;
        if (sort) {
          params.set("sortBy", sort.id);
          params.set("sortOrder", sort.desc ? "desc" : "asc");
        } else {
          params.delete("sortBy");
          params.delete("sortOrder");
        }
        params.set("page", "1");
      }),
    [updateParams],
  );

  // --- Filters ---
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const result: ColumnFiltersState = [];
    for (const key of filterKeys) {
      const raw = searchParams.get(key);
      if (raw)
        result.push({ id: key, value: raw.split(MULTI_VALUE_SEPARATOR) });
    }
    return result;
  }, [searchParams, filterKeys]);

  const onColumnFiltersChange = useCallback(
    (next: ColumnFiltersState) =>
      updateParams((params) => {
        for (const key of filterKeys) {
          const value = next.find((entry) => entry.id === key)?.value;
          const serialized = Array.isArray(value)
            ? value.join(MULTI_VALUE_SEPARATOR)
            : value != null
              ? String(value)
              : "";
          if (serialized) params.set(key, serialized);
          else params.delete(key);
        }
        params.set("page", "1");
      }),
    [updateParams, filterKeys],
  );

  // --- API query string (page/limit/q/sort/dir + repeated filter params) ---
  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (urlSearch) params.set("q", urlSearch);
    if (sortBy) {
      params.set("sort", sortBy);
      params.set("dir", sortOrder);
    }
    for (const key of filterKeys) {
      const raw = searchParams.get(key);
      if (raw) {
        raw
          .split(MULTI_VALUE_SEPARATOR)
          .forEach((value) => params.append(key, value));
      }
    }
    return params.toString();
  }, [page, limit, urlSearch, sortBy, sortOrder, searchParams, filterKeys]);

  return {
    page,
    limit,
    sorting,
    columnFilters,
    globalFilter: search,
    apiParams,
    onPageChange,
    onLimitChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange: setSearch,
  };
};
