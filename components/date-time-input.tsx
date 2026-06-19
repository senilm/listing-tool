"use client";

import { parseDate } from "chrono-node";
import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// A natural-language date + time picker. The user can type "next monday 9am"
// (parsed by chrono-node into a full instant) or pick a day from the Calendar
// popover. Emits a single Date — or undefined when the text is empty/unparseable
// — so callers always get a complete instant, never a date-only value.
type DateTimeInputProps = {
  value?: Date;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
  placeholder?: string;
};

const DEFAULT_HOUR = 9;
const DISPLAY_FORMAT = "PPP, HH:mm";

export const DateTimeInput = ({
  value,
  onChange,
  disabled,
  minDate,
  maxDate,
  error,
  placeholder = "e.g. next monday 9am",
}: DateTimeInputProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() =>
    value ? format(value, DISPLAY_FORMAT) : "",
  );
  const [parseFailed, setParseFailed] = useState(false);

  const handleTextChange = (raw: string) => {
    setText(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setParseFailed(false);
      onChange(undefined);
      return;
    }
    const parsed = parseDate(trimmed);
    if (parsed) {
      setParseFailed(false);
      onChange(parsed);
    } else {
      setParseFailed(true);
      onChange(undefined);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const next = new Date(date);
    next.setHours(
      value?.getHours() ?? DEFAULT_HOUR,
      value?.getMinutes() ?? 0,
      0,
      0,
    );
    setParseFailed(false);
    setText(format(next, DISPLAY_FORMAT));
    onChange(next);
    setOpen(false);
  };

  const showError = Boolean(error) || parseFailed;

  return (
    <div className="flex flex-col gap-1.5">
      <InputGroup>
        <InputGroupInput
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={showError ? true : undefined}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Pick a date"
                disabled={disabled}
              >
                <CalendarIcon />
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              sideOffset={8}
            >
              <Calendar
                mode="single"
                selected={value}
                captionLayout="dropdown"
                defaultMonth={value ?? minDate}
                startMonth={minDate}
                endMonth={maxDate}
                onSelect={handleCalendarSelect}
                disabled={(date) => {
                  if (minDate && date < startOfDay(minDate)) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {parseFailed ? (
        <p className="px-1 text-xs text-destructive">
          Couldn’t read that date — try “next monday 9am”.
        </p>
      ) : value && !error ? (
        <p className="px-1 text-xs text-muted-foreground">
          Goes live {format(value, "EEE d MMM yyyy 'at' h:mm a")}
        </p>
      ) : null}
    </div>
  );
};
