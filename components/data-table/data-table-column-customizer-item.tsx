"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { TruncatedText } from "@/components/truncated-text";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DataTableColumnCustomizerItemProps = {
  id: string;
  label: string;
  checked: boolean;
  canHide: boolean;
  onToggle: (visible: boolean) => void;
};

export const DataTableColumnCustomizerItem = ({
  id,
  label,
  checked,
  canHide,
  onToggle,
}: DataTableColumnCustomizerItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md px-1 py-1.5",
        isDragging && "bg-muted",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Checkbox
        id={`col-vis-${id}`}
        checked={checked}
        disabled={!canHide}
        onCheckedChange={(value) => onToggle(!!value)}
      />
      <label
        htmlFor={`col-vis-${id}`}
        className="min-w-0 flex-1 cursor-pointer text-sm"
      >
        <TruncatedText>{label}</TruncatedText>
      </label>
    </div>
  );
};
