"use client";

import { type Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { toSafeDate, formatDateToISO } from "@/lib/format";

type DateRangeValue = { from?: string; to?: string };

type DataTableDateFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
};

export const DataTableDateFilter = <TData, TValue>({
  column,
  title,
}: DataTableDateFilterProps<TData, TValue>) => {
  const value = (column.getFilterValue() as DateRangeValue | undefined) ?? {};

  const selected: DateRange | undefined =
    value.from || value.to
      ? {
          from: value.from ? toSafeDate(value.from) : undefined,
          to: value.to ? toSafeDate(value.to) : undefined,
        }
      : undefined;

  const label = value.from
    ? value.to
      ? `${format(toSafeDate(value.from), "MMM d")} – ${format(toSafeDate(value.to), "MMM d")}`
      : format(toSafeDate(value.from), "MMM d")
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <CalendarIcon />
          {title}
          {!!label && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {label}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          numberOfMonths={2}
          onSelect={(range) =>
            column.setFilterValue(
              range?.from || range?.to
                ? {
                    from: range?.from ? formatDateToISO(range.from) : undefined,
                    to: range?.to ? formatDateToISO(range.to) : undefined,
                  }
                : undefined,
            )
          }
        />
        {!!label && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => column.setFilterValue(undefined)}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
