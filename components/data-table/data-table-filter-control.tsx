"use client";

import { type Table } from "@tanstack/react-table";

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableTextFilter } from "@/components/data-table/data-table-text-filter";
import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";

type DataTableFilterControlProps<TData> = {
  table: Table<TData>;
  field: DataTableFilterField;
};

// Picks the right filter control for a field's type. Renders nothing if the
// column isn't present on the table.
export const DataTableFilterControl = <TData,>({
  table,
  field,
}: DataTableFilterControlProps<TData>) => {
  const column = table.getColumn(field.id);
  if (!column) return null;

  switch (field.type) {
    case DataTableFilterType.Text:
      return (
        <DataTableTextFilter
          column={column}
          placeholder={field.placeholder ?? field.label}
        />
      );
    case DataTableFilterType.DateRange:
      return <DataTableDateFilter column={column} title={field.label} />;
    case DataTableFilterType.Select:
    case DataTableFilterType.MultiSelect:
      return (
        <DataTableFacetedFilter
          column={column}
          title={field.label}
          options={field.options ?? []}
          multiple={field.type === DataTableFilterType.MultiSelect}
        />
      );
    default:
      return null;
  }
};
