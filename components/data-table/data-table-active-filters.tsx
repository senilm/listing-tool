"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { TruncatedText } from "@/components/truncated-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joinTruthy } from "@/lib/utils";

type DataTableActiveFiltersProps<TData> = {
  table: Table<TData>;
  filterFields: DataTableFilterField[];
  globalFilter?: string;
  onClearGlobalFilter?: () => void;
};

const formatValue = (field: DataTableFilterField, value: unknown): string => {
  if (
    field.type === DataTableFilterType.DateRange &&
    value &&
    typeof value === "object"
  ) {
    const range = value as { from?: string; to?: string };
    return joinTruthy([range.from, range.to], " – ") || "Any";
  }

  const labelFor = (raw: string) =>
    field.options?.find((option) => option.value === raw)?.label ?? raw;

  if (Array.isArray(value)) {
    return value.map((entry) => labelFor(String(entry))).join(", ");
  }
  return labelFor(String(value));
};

export const DataTableActiveFilters = <TData,>({
  table,
  filterFields,
  globalFilter,
  onClearGlobalFilter,
}: DataTableActiveFiltersProps<TData>) => {
  const columnFilters = table.getState().columnFilters;
  const hasGlobal = Boolean(globalFilter);

  if (!columnFilters.length && !hasGlobal) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!!hasGlobal && (
        <Badge variant="secondary" className="gap-1 font-normal">
          <span className="text-muted-foreground">Search:</span>
          <TruncatedText className="max-w-32">{globalFilter}</TruncatedText>
          <button
            type="button"
            onClick={onClearGlobalFilter}
            aria-label="Clear search"
            className="ml-0.5 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {columnFilters.map((filter) => {
        const field = filterFields.find((entry) => entry.id === filter.id);
        if (!field) return null;
        return (
          <Badge
            key={filter.id}
            variant="secondary"
            className="gap-1 font-normal"
          >
            <span className="text-muted-foreground">{field.label}:</span>
            <TruncatedText className="max-w-40">
              {formatValue(field, filter.value)}
            </TruncatedText>
            <button
              type="button"
              onClick={() =>
                table.getColumn(filter.id)?.setFilterValue(undefined)
              }
              aria-label={`Clear ${field.label} filter`}
              className="ml-0.5 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </Badge>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          table.resetColumnFilters();
          onClearGlobalFilter?.();
        }}
      >
        Clear all
      </Button>
    </div>
  );
};
