"use client";

import { Typography } from "@/components/typography";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ListingOption } from "@/lib/ebay/account-setup";

type PolicySelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: ListingOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const PolicySelectField = ({
  id,
  label,
  placeholder,
  value,
  options,
  disabled = false,
  onChange,
}: PolicySelectFieldProps) => {
  const isEmpty = options.length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value === "" ? undefined : value}
        onValueChange={onChange}
        disabled={disabled || isEmpty}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isEmpty && !disabled ? (
        <Typography variant="muted" className="text-xs">
          None found on this account.
        </Typography>
      ) : null}
    </div>
  );
};
