import { InboxIcon, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { Typography } from "@/components/typography";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon: Icon = InboxIcon,
  title = "Nothing here yet",
  description = "There are no items to display.",
  children,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex h-full flex-col items-center justify-center gap-3 py-16",
      className,
    )}
  >
    <Icon className="size-12 text-muted-foreground/40" />
    <div className="text-center">
      <Typography variant="small">{title}</Typography>
      <Typography variant="muted" className="mt-1">
        {description}
      </Typography>
    </div>
    {children ? <div className="mt-2">{children}</div> : null}
  </div>
);
