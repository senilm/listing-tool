import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type InlineAlertProps = {
  children: ReactNode;
  className?: string;
};

export const InlineAlert = ({ children, className }: InlineAlertProps) => (
  <div
    className={cn(
      "relative rounded-md border border-border border-l-0 bg-border/20 px-4 py-3 shadow-[inset_3px_0_0_0_#99a1af]",
      className,
    )}
  >
    <div className="flex gap-2.5 items-start">
      <AlertTriangle className="size-3 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-4">{children}</p>
    </div>
  </div>
);
