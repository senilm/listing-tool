"use client";

import { type Header } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

type DataTableResizeHandleProps<TData, TValue> = {
  header: Header<TData, TValue>;
};

// Drag to resize; double-click to reset. Render inside a relative TableHead.
// A thin divider stays visible at the column edge; the wider invisible zone is
// the grab target, and the line thickens/highlights on hover and while dragging.
export const DataTableResizeHandle = <TData, TValue>({
  header,
}: DataTableResizeHandleProps<TData, TValue>) => (
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    onDoubleClick={() => header.column.resetSize()}
    className="group/resize absolute top-0 -right-1 z-10 flex h-full w-2 cursor-col-resize touch-none items-center justify-center select-none"
  >
    <span
      className={cn(
        "h-1/2 w-px bg-border transition-all group-hover/resize:h-full group-hover/resize:w-0.5 group-hover/resize:bg-primary/60",
        header.column.getIsResizing() && "h-full w-0.5 bg-primary",
      )}
    />
  </div>
);
