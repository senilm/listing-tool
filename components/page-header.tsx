import { type ReactNode } from "react";

import { Typography } from "@/components/typography";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
};

export const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <Typography variant="h3" as="h1">
          {title}
        </Typography>
        {description && <Typography variant="muted">{description}</Typography>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
