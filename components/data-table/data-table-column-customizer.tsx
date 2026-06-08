"use client";

import { type Column, type Table } from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTableColumnCustomizerItem } from "@/components/data-table/data-table-column-customizer-item";

const FIXED_COLUMNS = new Set(["select", "actions"]);

const columnLabel = <TData,>(column: Column<TData, unknown>): string =>
  column.columnDef.meta?.label ??
  (typeof column.columnDef.header === "string"
    ? column.columnDef.header
    : column.id);

export const DataTableColumnCustomizer = <TData,>({
  table,
}: {
  table: Table<TData>;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = table
    .getAllLeafColumns()
    .filter((column) => !FIXED_COLUMNS.has(column.id));
  const ids = columns.map((column) => column.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = arrayMove(
      ids,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id)),
    );
    const allIds = table.getAllLeafColumns().map((column) => column.id);
    const leading = allIds.filter((id) => id === "select");
    const trailing = allIds.filter((id) => id === "actions");
    table.setColumnOrder([...leading, ...reordered, ...trailing]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">
          Toggle &amp; reorder columns
        </p>
        <ScrollArea className="max-h-72">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {columns.map((column) => (
                <DataTableColumnCustomizerItem
                  key={column.id}
                  id={column.id}
                  label={columnLabel(column)}
                  checked={column.getIsVisible()}
                  canHide={column.getCanHide()}
                  onToggle={(visible) => column.toggleVisibility(visible)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
