import { AlertTriangle } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type InlineAlertProps = {
  children: ReactNode;
  className?: string;
};

export const InlineAlert = ({ children, className }: InlineAlertProps) => (
  <div
    className={cn(
      "relative rounded-md border border-l-0 border-border bg-border/20 px-4 py-3 shadow-[inset_3px_0_0_0_#99a1af]",
      className,
    )}
  >
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
      <p className="text-xs leading-4 text-muted-foreground">{children}</p>
    </div>
  </div>
);
