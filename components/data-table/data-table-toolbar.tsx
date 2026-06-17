"use client";

import { type Table } from "@tanstack/react-table";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { DataTableActiveFilters } from "@/components/data-table/data-table-active-filters";
import { DataTableColumnCustomizer } from "@/components/data-table/data-table-column-customizer";
import { DataTableExport } from "@/components/data-table/data-table-export";
import { DataTableFilterControl } from "@/components/data-table/data-table-filter-control";
import { type DataTableFilterField } from "@/components/data-table/data-table.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type DataTableExportControls } from "@/hooks/use-data-table-export";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  filterFields?: DataTableFilterField[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  enableGlobalFilter?: boolean;
  toolbarActions?: ReactNode;
  exportControls?: DataTableExportControls;
  enableColumnCustomizer?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export const DataTableToolbar = <TData,>({
  table,
  filterFields = [],
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search…",
  enableGlobalFilter = true,
  toolbarActions,
  exportControls,
  enableColumnCustomizer = true,
  onRefresh,
  isRefreshing = false,
}: DataTableToolbarProps<TData>) => {
  const [search, setSearch] = useState(globalFilter ?? "");
  const [prevGlobalFilter, setPrevGlobalFilter] = useState(globalFilter);
  const debounced = useDebounce(search, 350);

  useEffect(() => {
    onGlobalFilterChange?.(debounced);
  }, [debounced, onGlobalFilterChange]);

  // Adjust the input during render (not in an effect) when the value is changed
  // externally — but ignore our own debounced echo so typing isn't interrupted.
  if (globalFilter !== prevGlobalFilter) {
    setPrevGlobalFilter(globalFilter);
    if ((globalFilter ?? "") !== debounced) setSearch(globalFilter ?? "");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {!!enableGlobalFilter && (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8"
              />
            </div>
          )}
          {filterFields.map((field) => (
            <DataTableFilterControl
              key={field.id}
              table={table}
              field={field}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {toolbarActions}
          {!!onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh"
            >
              <RefreshCw className={cn(isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
          {!!enableColumnCustomizer && (
            <DataTableColumnCustomizer table={table} />
          )}
          {!!exportControls && <DataTableExport {...exportControls} />}
        </div>
      </div>
      <DataTableActiveFilters
        table={table}
        filterFields={filterFields}
        globalFilter={globalFilter}
        onClearGlobalFilter={() => {
          setSearch("");
          onGlobalFilterChange?.("");
        }}
      />
    </div>
  );
};
