"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

type MultiToggleGroupProps = Omit<
  Extract<
    React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
    { type: "multiple" }
  >,
  "type"
>;

export const MultiToggleGroup = ({
  className,
  children,
  ...props
}: MultiToggleGroupProps) => (
  <ToggleGroupPrimitive.Root
    data-slot="multi-toggle-group"
    type="multiple"
    className={cn("flex w-full gap-2", className)}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Root>
);

export const MultiToggleGroupItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) => (
  <ToggleGroupPrimitive.Item
    data-slot="multi-toggle-group-item"
    className={cn(
      "relative inline-flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-md border px-3 text-xs font-medium",
      "border-input bg-background text-foreground shadow-sm",
      "transition-colors duration-200",
      "hover:bg-accent",
      "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
);
