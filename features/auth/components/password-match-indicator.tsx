import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type PasswordMatchIndicatorProps = {
  password: string;
  confirmPassword: string;
};

export const PasswordMatchIndicator = ({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) => {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        matches ? "text-emerald-600" : "text-destructive",
      )}
    >
      {matches ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {matches ? "Passwords match" : "Passwords do not match"}
    </p>
  );
};
