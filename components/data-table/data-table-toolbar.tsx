"use client";

import { type Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTableFilterControl } from "@/components/data-table/data-table-filter-control";
import { DataTableActiveFilters } from "@/components/data-table/data-table-active-filters";
import { DataTableColumnCustomizer } from "@/components/data-table/data-table-column-customizer";
import { DataTableExport } from "@/components/data-table/data-table-export";
import {
  type DataTableExportHandlers,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  filterFields?: DataTableFilterField[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  enableGlobalFilter?: boolean;
  toolbarActions?: ReactNode;
  exportHandlers?: DataTableExportHandlers;
  enableColumnCustomizer?: boolean;
};

export const DataTableToolbar = <TData,>({
  table,
  filterFields = [],
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search…",
  enableGlobalFilter = true,
  toolbarActions,
  exportHandlers,
  enableColumnCustomizer = true,
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
          {enableGlobalFilter && (
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
            <DataTableFilterControl key={field.id} table={table} field={field} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {toolbarActions}
          {enableColumnCustomizer && <DataTableColumnCustomizer table={table} />}
          {exportHandlers && <DataTableExport handlers={exportHandlers} />}
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
