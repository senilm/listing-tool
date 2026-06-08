import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-4",
  md: "size-8",
  lg: "size-12",
} as const;

type SpinnerProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
};

// Inline spinner — drop it anywhere a loading affordance is needed.
export const Spinner = ({ className, size = "sm" }: SpinnerProps) => (
  <Loader2
    className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
  />
);

// Centered spinner that fills its container — for full-area / page loading.
export const CenteredSpinner = ({ className, size = "md" }: SpinnerProps) => (
  <div className={cn("flex h-full items-center justify-center py-8", className)}>
    <Spinner size={size} />
  </div>
);
