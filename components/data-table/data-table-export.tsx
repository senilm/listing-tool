"use client";

import { Download, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type DataTableExportControls } from "@/hooks/use-data-table-export";

export const DataTableExport = ({
  isExporting,
  disabled,
  onExportCsv,
  onExportXlsx,
}: DataTableExportControls) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" disabled={isExporting || disabled}>
        {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48" align="end">
      <DropdownMenuItem disabled={isExporting} onSelect={() => onExportCsv()}>
        CSV
      </DropdownMenuItem>
      <DropdownMenuItem disabled={isExporting} onSelect={() => onExportXlsx()}>
        Excel (XLSX)
      </DropdownMenuItem>
      <p className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] leading-tight text-muted-foreground">
        <Info className="size-3 shrink-0" />
        Reflects current filters and search.
      </p>
    </DropdownMenuContent>
  </DropdownMenu>
);
