"use client";

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TruncatedTextProps = {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  tooltipClassName?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "a";
  onClick?: () => void;
  fallbackTooltip?: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

// Truncates to its container and shows a tooltip with the full text only when
// the content is actually clipped (measured on hover).
export const TruncatedText = ({
  children,
  maxWidth,
  className,
  tooltipClassName,
  as: Tag = "span",
  onClick,
  fallbackTooltip,
  href,
  target,
  rel,
}: TruncatedTextProps) => {
  const [isTruncated, setIsTruncated] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  const handlePointerEnter = () => {
    const el = ref.current;
    setIsTruncated(!!el && el.scrollWidth > el.clientWidth);
  };

  const tooltipContent = isTruncated ? children : fallbackTooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Tag
          ref={ref as React.RefObject<never>}
          onClick={onClick}
          onPointerEnter={handlePointerEnter}
          style={maxWidth ? { maxWidth } : undefined}
          className={cn(
            "inline-block truncate align-bottom",
            !maxWidth && "max-w-full",
            className,
          )}
          {...(Tag === "a" ? { href, target, rel } : {})}
        >
          {children}
        </Tag>
      </TooltipTrigger>
      {tooltipContent ? (
        <TooltipContent
          side="bottom"
          className={cn("max-w-80 text-pretty", tooltipClassName)}
        >
          {tooltipContent}
        </TooltipContent>
      ) : null}
    </Tooltip>
  );
};
