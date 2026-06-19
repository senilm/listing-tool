"use client";

import { MoreHorizontal } from "lucide-react";
import { Fragment } from "react";

import { type DataTableRowAction } from "@/components/data-table/data-table.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          {!!action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            asChild={!!action.href}
            variant={
              action.variant === "destructive" ? "destructive" : "default"
            }
            disabled={action.disabled?.(row)}
            onClick={(event) => {
              event.stopPropagation();
              action.onSelect?.(row);
            }}
          >
            {action.href ? (
              <a href={action.href(row)}>
                {!!action.icon && <action.icon />}
                {action.label}
              </a>
            ) : (
              <>
                {!!action.icon && <action.icon />}
                {action.label}
              </>
            )}
          </DropdownMenuItem>
        </Fragment>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
