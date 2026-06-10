"use client";

import { type Header } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

type DataTableResizeHandleProps<TData, TValue> = {
  header: Header<TData, TValue>;
};

// Drag to resize; double-click to reset. Render inside a relative TableHead.
export const DataTableResizeHandle = <TData, TValue>({
  header,
}: DataTableResizeHandleProps<TData, TValue>) => (
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    onDoubleClick={() => header.column.resetSize()}
    className={cn(
      "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-border opacity-0 transition-opacity select-none hover:opacity-100",
      header.column.getIsResizing() && "bg-primary opacity-100",
    )}
  />
);
