import { type LucideIcon } from "lucide-react";
import { type RowData } from "@tanstack/react-table";

// Lets a column declare a human label (used by the column customizer and the
// active-filter chips, where the header may be a component, not a string).
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

// Server-driven pagination. `page` is 1-based; the table never paginates itself.
export type DataTablePaginationState = {
  page: number;
  limit: number;
  total: number;
};

export type FacetedFilterOption = {
  label: string;
  value: string;
};

export enum DataTableFilterType {
  Text = "text",
  Select = "select",
  MultiSelect = "multi-select",
  DateRange = "date-range",
}

// Declarative filter config — drives the toolbar's faceted filters.
export type DataTableFilterField = {
  id: string;
  label: string;
  type: DataTableFilterType;
  options?: FacetedFilterOption[];
  placeholder?: string;
};

export type DataTableExportHandlers = {
  csv?: () => void | Promise<void>;
  xlsx?: () => void | Promise<void>;
  pdf?: () => void | Promise<void>;
};

export type DataTableRowAction<TData> = {
  label: string;
  icon?: LucideIcon;
  onSelect: (row: TData) => void;
  variant?: "default" | "destructive";
  disabled?: (row: TData) => boolean;
  separatorBefore?: boolean;
};
