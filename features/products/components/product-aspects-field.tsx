"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { type ProductFormValues } from "@/validations/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";
import { Typography } from "@/components/typography";

type ProductAspectsFieldProps = {
  control: Control<ProductFormValues>;
};

// Item specifics (Metal → "Gold", Gemstone → "Diamond, Ruby"). Values are
// entered comma-separated; the form mapper splits them into a string[].
export const ProductAspectsField = ({ control }: ProductAspectsFieldProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "aspects",
  });

  return (
    <FieldGroup>
      {fields.length === 0 ? (
        <Typography variant="muted" className="text-sm">
          No item specifics yet. Add a name and one or more comma-separated
          values.
        </Typography>
      ) : null}

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`aspects.${index}.name`}
            className="w-40 shrink-0"
            render={(formField) => <Input placeholder="Metal" {...formField} />}
          />
          <FormField
            control={control}
            name={`aspects.${index}.values`}
            className="flex-1"
            render={(formField) => (
              <Input placeholder="Gold, White Gold" {...formField} />
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-0.5"
            onClick={() => remove(index)}
            aria-label="Remove item specific"
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
          onClick={() => append({ name: "", values: "" })}
        >
          <Plus />
          Add item specific
        </Button>
      </div>
    </FieldGroup>
  );
};
