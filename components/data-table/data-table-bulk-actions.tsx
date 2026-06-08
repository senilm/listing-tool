"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type DataTableBulkActionsProps = {
  selectedCount: number;
  onClear: () => void;
  children?: ReactNode;
};

export const DataTableBulkActions = ({
  selectedCount,
  onClear,
  children,
}: DataTableBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button variant="ghost" size="icon-xs" onClick={onClear}>
        <X />
        <span className="sr-only">Clear selection</span>
      </Button>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
};
