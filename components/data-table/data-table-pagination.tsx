"use client";

import { type Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DataTablePaginationState } from "@/components/data-table/data-table.types";

// First/last/current±1 with ellipsis once there are more than 7 pages.
const getPageItems = (
  page: number,
  pageCount: number,
): Array<number | "ellipsis"> => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < pageCount - 1) items.push("ellipsis");

  items.push(pageCount);
  return items;
};

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pagination: DataTablePaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
  enableRowSelection?: boolean;
};

export const DataTablePagination = <TData,>({
  table,
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  enableRowSelection,
}: DataTablePaginationProps<TData>) => {
  const { page, limit, total } = pagination;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const selectedCount = table.getSelectedRowModel().rows.length;

  const goTo = (next: number) => {
    if (next < 1 || next > pageCount || next === page) return;
    onPageChange(next);
  };

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {enableRowSelection && selectedCount > 0
          ? `${selectedCount} of ${total} row(s) selected.`
          : `${total} row(s).`}
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  goTo(page - 1);
                }}
                aria-disabled={page <= 1}
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {getPageItems(page, pageCount).map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === page}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  goTo(page + 1);
                }}
                aria-disabled={page >= pageCount}
                className={cn(page >= pageCount && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
