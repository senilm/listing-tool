"use client";

import { Fragment } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type DataTableRowAction } from "@/components/data-table/data-table.types";

type DataTableRowActionsProps<TData> = {
  row: TData;
  actions: DataTableRowAction<TData>[];
};

export const DataTableRowActions = <TData,>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(event) => event.stopPropagation()}
      >
        <MoreHorizontal />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      {actions.map((action, index) => (
        <Fragment key={action.label}>
          {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            variant={action.variant === "destructive" ? "destructive" : "default"}
            disabled={action.disabled?.(row)}
            onClick={(event) => {
              event.stopPropagation();
              action.onSelect(row);
            }}
          >
            {action.icon && <action.icon />}
            {action.label}
          </DropdownMenuItem>
        </Fragment>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
