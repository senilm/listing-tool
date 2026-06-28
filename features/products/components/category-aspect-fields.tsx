"use client";

import { type Control } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { EnumSelectField } from "@/features/products/components/enum-select-field";
import { type CategoryId } from "@/lib/categories/category-id";
import { FieldInput } from "@/lib/categories/field-def";
import { CATEGORY_REGISTRY } from "@/lib/categories/registry";
import { type ProductFormValues } from "@/validations/product";

type CategoryAspectFieldsProps = {
  control: Control<ProductFormValues>;
  categoryId: CategoryId;
};

// Renders the item-specific fields for the selected category straight from the
// registry: enum fields become dropdowns, everything else a text input. Each
// field binds to aspects.<aspectName>, the shape the mappers read/write.
export const CategoryAspectFields = ({
  control,
  categoryId,
}: CategoryAspectFieldsProps) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {CATEGORY_REGISTRY[categoryId].fields.map((field) => {
      // `aspects.${string}` is a valid path into the aspects record, so its
      // value type stays string — no widening cast needed.
      const name = `aspects.${field.aspect}` as const;

      if (field.input === FieldInput.Enum && field.options) {
        return (
          <EnumSelectField
            key={field.aspect}
            control={control}
            name={name}
            label={field.aspect}
            required={field.required}
            options={field.options}
          />
        );
      }

      return (
        <FormField
          key={field.aspect}
          control={control}
          name={name}
          label={field.aspect}
          required={field.required}
          render={(formField) => (
            <Input {...formField} value={formField.value ?? ""} />
          )}
        />
      );
    })}
  </div>
);
