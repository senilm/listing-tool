"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  toSafeDate,
  formatDateToISO,
  CALENDAR_START,
  CALENDAR_END,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type DateInputProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  disablePastDates?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: boolean;
  side?: "top" | "bottom" | "left" | "right";
};

export const DateInput = ({
  value,
  onChange,
  disabled,
  disablePastDates,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  error,
  side,
}: DateInputProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(toSafeDate(value), "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side={side}>
        <Calendar
          mode="single"
          defaultMonth={
            value
              ? toSafeDate(value)
              : minDate
                ? toSafeDate(minDate)
                : undefined
          }
          selected={value ? toSafeDate(value) : undefined}
          startMonth={minDate ? toSafeDate(minDate) : CALENDAR_START}
          endMonth={maxDate ? toSafeDate(maxDate) : CALENDAR_END}
          onSelect={(date) => {
            onChange(date ? formatDateToISO(date) : "");
            setOpen(false);
          }}
          disabled={(date) => {
            if (disablePastDates && date < new Date()) return true;
            if (minDate && date < toSafeDate(minDate)) return true;
            if (maxDate && date > toSafeDate(maxDate)) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
