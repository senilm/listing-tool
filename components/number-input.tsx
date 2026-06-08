import * as React from "react";

import { Input } from "@/components/ui/input";
import { blockNegativeKeyDown } from "@/lib/numeric-input";

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "onChange" | "value"
> & {
  value: number | undefined | null;
  onChange: (value: number | null | undefined) => void;
  emptyValue?: number | null;
  allowNegative?: boolean;
};

export const NumberInput = ({
  value,
  onChange,
  emptyValue = null,
  allowNegative = false,
  min,
  max,
  onKeyDown,
  ...props
}: NumberInputProps) => (
  <Input
    type="number"
    min={min ?? (allowNegative ? undefined : 0)}
    max={max}
    value={value ?? ""}
    onKeyDown={(e) => {
      blockNegativeKeyDown(e, allowNegative);
      onKeyDown?.(e);
    }}
    onChange={(e) => {
      if (e.target.value === "") return onChange(emptyValue);
      const next = Number(e.target.value);
      if (Number.isNaN(next)) return;
      if (!allowNegative && next < 0) return;
      if (max != null && next > Number(max)) return;
      onChange(next);
    }}
    {...props}
  />
);
