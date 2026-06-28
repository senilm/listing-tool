"use client";

import { type Control } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { EnumSelectField } from "@/features/products/components/enum-select-field";
import { type FieldDef, FieldInput } from "@/lib/categories/field-def";
import { type ProductFormValues } from "@/validations/product";

type AspectFieldProps = {
  control: Control<ProductFormValues>;
  field: FieldDef;
};

export const AspectField = ({ control, field }: AspectFieldProps) => {
  const name = `aspects.${field.aspect}` as const;

  if (field.input === FieldInput.Enum && field.options) {
    return (
      <EnumSelectField
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
      control={control}
      name={name}
      label={field.aspect}
      required={field.required}
      render={(formField) => (
        <Input {...formField} value={formField.value ?? ""} />
      )}
    />
  );
};
