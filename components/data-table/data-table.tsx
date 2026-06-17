"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnSizingState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { DataTableDefaultCell } from "@/components/data-table/data-table-default-cell";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableResizeHandle } from "@/components/data-table/data-table-resize-handle";
import { createSelectionColumn } from "@/components/data-table/data-table-select-column";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import {
  type DataTableExportHandlers,
  type DataTableFilterField,
  type DataTablePaginationState,
} from "@/components/data-table/data-table.types";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  getRowId?: (row: TData) => string;

  // Server-driven — the parent owns these and refetches on change.
  pagination: DataTablePaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;

  filterFields?: DataTableFilterField[];
  enableRowSelection?: boolean;
  renderBulkActions?: (rows: TData[]) => React.ReactNode;
  exportHandlers?: DataTableExportHandlers;
  toolbarActions?: React.ReactNode;

  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  enableColumnResizing?: boolean;
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
};

export const DataTable = <TData,>({
  columns,
  data,
  getRowId,
  pagination,
  onPageChange,
  onLimitChange,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  filterFields,
  enableRowSelection = false,
  renderBulkActions,
  exportHandlers,
  toolbarActions,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onRowClick,
  enableColumnResizing = true,
  enableGlobalFilter = true,
  searchPlaceholder,
  pageSizeOptions,
}: DataTableProps<TData>) => {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    [],
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});

  const sorting = controlledSorting ?? internalSorting;
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;

  const tableColumns = React.useMemo(
    () =>
      enableRowSelection
        ? [createSelectionColumn<TData>(), ...columns]
        : columns,
    [columns, enableRowSelection],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = functionalUpdate(updater, sorting);
    setInternalSorting(next);
    onSortingChange?.(next);
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updater,
  ) => {
    const next = functionalUpdate(updater, columnFilters);
    setInternalColumnFilters(next);
    onColumnFiltersChange?.(next);
  };

  const handleGlobalFilterChange: OnChangeFn<string> = (updater) => {
    const next = functionalUpdate(updater, globalFilter);
    setInternalGlobalFilter(next);
    onGlobalFilterChange?.(next);
  };

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: pagination.total,
    enableRowSelection,
    columnResizeMode: "onChange",
    enableColumnResizing,
    defaultColumn: {
      minSize: 60,
      cell: DataTableDefaultCell,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <DataTableToolbar
        table={table}
        filterFields={filterFields}
        globalFilter={globalFilter}
        onGlobalFilterChange={(value) => handleGlobalFilterChange(value)}
        searchPlaceholder={searchPlaceholder}
        enableGlobalFilter={enableGlobalFilter}
        toolbarActions={toolbarActions}
        exportHandlers={exportHandlers}
      />

      {!!enableRowSelection && !!renderBulkActions && (
        <DataTableBulkActions
          selectedCount={selectedRows.length}
          onClear={() => table.resetRowSelection()}
        >
          {renderBulkActions(selectedRows)}
        </DataTableBulkActions>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border">
        <Table
          style={
            enableColumnResizing
              ? { width: "100%", minWidth: table.getCenterTotalSize() }
              : undefined
          }
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="relative"
                    style={
                      enableColumnResizing
                        ? { width: header.getSize() }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {!!enableColumnResizing && header.column.getCanResize() && (
                      <DataTableResizeHandle header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {isLoading ? (
            <DataTableSkeleton columns={visibleColumnCount} />
          ) : (
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={
                        enableColumnResizing
                          ? { width: cell.column.getSize() }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

        {!isLoading && !rows.length && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="flex-1 py-0"
          />
        )}
      </div>

      <DataTablePagination
        table={table}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        enableRowSelection={enableRowSelection}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
};
