"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ProductFormValues } from "@/validations/product";

type ProductImagesFieldProps = {
  control: Control<ProductFormValues>;
};

export const ProductImagesField = ({ control }: ProductImagesFieldProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  return (
    <FieldGroup>
      {fields.length === 0 ? (
        <Typography variant="muted" className="text-sm">
          No images yet. Add an image URL below.
        </Typography>
      ) : null}

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`images.${index}.url`}
            className="flex-1"
            render={(formField) => (
              <Input
                placeholder="https://example.com/image.jpg"
                inputMode="url"
                {...formField}
              />
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-0.5"
            onClick={() => remove(index)}
            aria-label="Remove image"
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ url: "" })}
        >
          <Plus />
          Add image URL
        </Button>
      </div>
    </FieldGroup>
  );
};
