import { type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const FormSection = ({
  title,
  description,
  children,
}: FormSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
