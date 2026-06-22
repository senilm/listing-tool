"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useFieldArray, useFormState, type Control } from "react-hook-form";

import { Typography } from "@/components/typography";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { ProductImageCard } from "@/features/products/components/product-image-card";
import { ProductImageUploader } from "@/features/products/components/product-image-uploader";
import { MAX_IMAGES, type ProductFormValues } from "@/validations/product";

type ProductImagesFieldProps = {
  control: Control<ProductFormValues>;
};

export const ProductImagesField = ({ control }: ProductImagesFieldProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "images",
  });
  const { errors } = useFormState({ control, name: "images" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((field) => field.id === active.id);
    const to = fields.findIndex((field) => field.id === over.id);
    if (from !== -1 && to !== -1) move(from, to);
  };

  const rootError = errors.images?.message ?? errors.images?.root?.message;

  return (
    <FieldGroup>
      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {fields.map((field, index) => (
                <ProductImageCard
                  key={field.id}
                  id={field.id}
                  url={field.url}
                  isPrimary={index === 0}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      <ProductImageUploader
        remainingSlots={MAX_IMAGES - fields.length}
        onUploaded={(url) => append({ url })}
      />

      <Typography variant="muted" className="text-xs">
        The first image is your eBay gallery photo. Drag to reorder. Up to{" "}
        {MAX_IMAGES} images.
      </Typography>

      {rootError ? <FieldError errors={[{ message: rootError }]} /> : null}
    </FieldGroup>
  );
};
