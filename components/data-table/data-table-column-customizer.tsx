"use client";

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
import { type Column, type Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { DataTableColumnCustomizerItem } from "@/components/data-table/data-table-column-customizer-item";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = table
    .getAllLeafColumns()
    .filter((column) => !FIXED_COLUMNS.has(column.id));
  const ids = columns.map((column) => column.id);

  const setAllVisible = (visible: boolean) => {
    columns.forEach((column) => {
      if (visible || column.getCanHide()) column.toggleVisibility(visible);
    });
  };

  const canShowAll = columns.some((column) => !column.getIsVisible());
  const canHideAll = columns.some(
    (column) => column.getCanHide() && column.getIsVisible(),
  );

  // dnd-kit reflects whatever element is under the pointer mid-drag, so the
  // cursor flickers between grab and the default arrow as it crosses gaps. Pin
  // the whole page to "grabbing" for the duration of the drag to keep it stable.
  const handleDragStart = () => {
    document.body.style.cursor = "grabbing";
  };

  const releaseCursor = () => {
    document.body.style.cursor = "";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    releaseCursor();

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
        <div className="flex gap-1 px-1 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1"
            disabled={!canShowAll}
            onClick={() => setAllVisible(true)}
          >
            Show all
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1"
            disabled={!canHideAll}
            onClick={() => setAllVisible(false)}
          >
            Hide all
          </Button>
        </div>
        <ScrollArea className="max-h-72">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={releaseCursor}
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
