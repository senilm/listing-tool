"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

type CopyIdProps = {
  value: string;
  className?: string;
};

export const CopyId = ({ value, className }: CopyIdProps) => {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    copy(value);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      className={cn(
        "group/copyid inline-flex cursor-pointer items-center gap-1",
        className,
      )}
    >
      <span className="font-medium text-foreground">{value}</span>
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover/copyid:opacity-100" />
      )}
    </button>
  );
};
