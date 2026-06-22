"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductImageCardProps = {
  id: string;
  url: string;
  isPrimary: boolean;
  onRemove: () => void;
};

export const ProductImageCard = ({
  id,
  url,
  isPrimary,
  onRemove,
}: ProductImageCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-md border bg-muted",
        isDragging && "z-10 opacity-70",
      )}
    >
      <Image
        src={url}
        alt="Product image"
        fill
        sizes="160px"
        className="object-cover"
      />

      {isPrimary ? (
        <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          Primary
        </span>
      ) : null}

      <button
        type="button"
        className="absolute top-1 right-1 cursor-grab touch-none rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        className="absolute right-1 bottom-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={onRemove}
        aria-label="Remove image"
      >
        <X />
      </Button>
    </div>
  );
};
