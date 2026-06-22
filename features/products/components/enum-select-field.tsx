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

type EnumSelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
};

// An enum-backed dropdown wired to RHF. Empty string means "unselected" and
// shows the placeholder; options never include "" (Radix forbids it as a value).
export const EnumSelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  required,
  placeholder = "Select…",
}: EnumSelectFieldProps<TFieldValues>) => (
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
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
);
