import { type ReactNode } from "react";

import { Typography } from "@/components/typography";

type AuthFormHeaderProps = {
  title: string;
  description: ReactNode;
};

export const AuthFormHeader = ({ title, description }: AuthFormHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-1.5">
      <Typography variant="h3" as="h1">
        {title}
      </Typography>
      <Typography variant="muted">{description}</Typography>
    </div>
  );
};
