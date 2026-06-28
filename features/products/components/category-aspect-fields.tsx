"use client";

import { type Control } from "react-hook-form";

import { FormSection } from "@/components/form-section";
import { AspectField } from "@/features/products/components/aspect-field";
import { type CategoryId } from "@/lib/categories/category-id";
import { groupCategoryFields } from "@/lib/categories/group-fields";
import { type ProductFormValues } from "@/validations/product";

type CategoryAspectFieldsProps = {
  control: Control<ProductFormValues>;
  categoryId: CategoryId;
};

// Renders the selected category's item-specific fields as one card per aspect
// group (see lib/categories/aspect-group.ts). Each group lays its fields out in
// a responsive grid; empty groups are dropped by groupCategoryFields.
export const CategoryAspectFields = ({
  control,
  categoryId,
}: CategoryAspectFieldsProps) => (
  <>
    {groupCategoryFields(categoryId).map(({ group, label, fields }) => (
      <FormSection key={group} title={label}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <AspectField key={field.aspect} control={control} field={field} />
          ))}
        </div>
      </FormSection>
    ))}
  </>
);
