"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type FormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName> & {
  id: string;
  "aria-invalid": boolean | undefined;
};

type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  render: (field: FormFieldRenderProps<TFieldValues, TName>) => React.ReactNode;
};

// Wires an RHF Controller to our Field primitives: renders the label, the
// control (with id + aria-invalid injected), description, and validation error.
export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  className,
  orientation,
  render,
}: FormFieldProps<TFieldValues, TName>) => {
  const id = React.useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid || undefined}
          orientation={orientation}
          className={className}
        >
          {label ? (
            <FieldLabel htmlFor={id}>
              {label}
              {required ? (
                <>
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                  <span className="sr-only">(required)</span>
                </>
              ) : null}
            </FieldLabel>
          ) : null}
          {render({
            ...field,
            id,
            "aria-invalid": fieldState.invalid || undefined,
          })}
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  );
};
