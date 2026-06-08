"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type DataTableExportHandlers } from "@/components/data-table/data-table.types";

type DataTableExportProps = {
  handlers: DataTableExportHandlers;
  disabled?: boolean;
};

export const DataTableExport = ({ handlers, disabled }: DataTableExportProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" disabled={disabled}>
        <Download />
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {handlers.csv && (
        <DropdownMenuItem onClick={() => handlers.csv?.()}>CSV</DropdownMenuItem>
      )}
      {handlers.xlsx && (
        <DropdownMenuItem onClick={() => handlers.xlsx?.()}>
          Excel (XLSX)
        </DropdownMenuItem>
      )}
      {handlers.pdf && (
        <DropdownMenuItem onClick={() => handlers.pdf?.()}>PDF</DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
