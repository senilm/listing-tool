import { type ReactNode } from "react";
import { InboxIcon, type LucideIcon } from "lucide-react";

import { Typography } from "@/components/typography";

type EmptyStateProps = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  children?: ReactNode;
};

export const EmptyState = ({
  icon: Icon = InboxIcon,
  title = "Nothing here yet",
  description = "There are no items to display.",
  children,
}: EmptyStateProps) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
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
