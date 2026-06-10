import { type LucideIcon } from "lucide-react";

import { TruncatedText } from "@/components/truncated-text";
import { Typography } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  tooltip?: string;
  variant?: "default" | "alert";
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  tooltip,
  variant = "default",
  onClick,
  active,
  className,
}: StatsCardProps) => {
  const isAlert = variant === "alert";

  const card = (
    <Card
      onClick={onClick}
      className={cn(
        "relative gap-0 overflow-hidden py-0",
        isAlert && "border-destructive/20 bg-destructive/5",
        onClick && "cursor-pointer transition-colors hover:border-primary/40",
        active && "border-primary/40",
        className,
      )}
    >
      <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <TruncatedText
            className={cn(
              "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
              isAlert && "text-destructive",
            )}
          >
            {title}
          </TruncatedText>
          <p
            className={cn(
              "truncate text-2xl font-bold tracking-tight",
              isAlert && "text-destructive",
            )}
          >
            {value}
          </p>
          {subtitle ? (
            <Typography variant="muted" className="truncate text-xs">
              {subtitle}
            </Typography>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              isAlert
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!tooltip) {
    return card;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-56 text-pretty">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
