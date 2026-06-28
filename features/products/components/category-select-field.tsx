"use client";

import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { FormField } from "@/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_REGISTRY } from "@/lib/categories/registry";

type CategorySelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  required?: boolean;
};

// eBay leaf-category picker. Shows the human label but stores the category id;
// the selected category drives which item-specific fields the form renders.
export const CategorySelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
}: CategorySelectFieldProps<TFieldValues>) => (
  <FormField
    control={control}
    name={name}
    label={label}
    required={required}
    render={(field) => (
      <Select value={field.value || undefined} onValueChange={field.onChange}>
        <SelectTrigger
          id={field.id}
          aria-invalid={field["aria-invalid"]}
          className="w-full"
        >
          <SelectValue placeholder="Select a category…" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(CATEGORY_REGISTRY).map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
);
