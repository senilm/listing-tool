"use client";

import { type CellContext } from "@tanstack/react-table";

import { TruncatedText } from "@/components/truncated-text";

// Default cell renderer: stringifies the value and truncates to the (resizable)
// column width with a hover tooltip. Columns with their own `cell` override it.
export const DataTableDefaultCell = <TData,>({
  getValue,
}: CellContext<TData, unknown>) => {
  const value = getValue();
  return <TruncatedText>{value == null ? "" : String(value)}</TruncatedText>;
};
