import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info";

const variantClasses: Record<StatusBadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

type StatusBadgeProps = {
  variant?: StatusBadgeVariant;
  className?: string;
  children: ReactNode;
};

export const StatusBadge = ({
  variant = "default",
  className,
  children,
}: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
      variantClasses[variant],
      className,
    )}
  >
    <span className="size-1.5 shrink-0 rounded-full bg-current" />
    {children}
  </span>
);
