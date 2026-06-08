"use client";

import { type Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

type DataTableTextFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  placeholder?: string;
};

// Debounced text filter bound to a single column's server-side filter value.
export const DataTableTextFilter = <TData, TValue>({
  column,
  placeholder,
}: DataTableTextFilterProps<TData, TValue>) => {
  const filterValue = (column.getFilterValue() as string | undefined) ?? "";
  const [value, setValue] = useState(filterValue);
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);
  const debounced = useDebounce(value, 350);

  useEffect(() => {
    column.setFilterValue(debounced || undefined);
  }, [debounced, column]);

  // Re-sync during render when the filter is cleared/changed externally
  // (e.g. an active-filter chip or "Clear all"), ignoring our own echo.
  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    if (filterValue !== debounced) setValue(filterValue);
  }

  return (
    <Input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      className="h-8 w-40"
    />
  );
};
