"use client";

import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { TruncatedText } from "@/components/truncated-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

// Use as a column def `header`. Sorting is server-side — toggling updates the
// controlled sorting state, which the parent uses to refetch.
export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) => {
  if (!column.getCanSort()) {
    return (
      <TruncatedText className={cn("text-xs font-medium", className)}>
        {title}
      </TruncatedText>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-7", className)}
      onClick={() => {
        // Cycle: none → asc → desc → none
        if (sorted === "desc") column.clearSorting();
        else column.toggleSorting(sorted === "asc");
      }}
    >
      <TruncatedText>{title}</TruncatedText>
      {sorted === "asc" ? (
        <ArrowUp />
      ) : sorted === "desc" ? (
        <ArrowDown />
      ) : (
        <ChevronsUpDown className="text-muted-foreground" />
      )}
    </Button>
  );
};
