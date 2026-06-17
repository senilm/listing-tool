"use client";

import { format } from "date-fns";
import { Check, Copy, TriangleAlert } from "lucide-react";

import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { joinTruthy } from "@/lib/utils";

type PublicationErrorDialogProps = {
  errorMessage: string;
  productTitle?: string | null;
  accountLabel?: string | null;
  failedAt?: Date | null;
};

export const PublicationErrorDialog = ({
  errorMessage,
  productTitle,
  accountLabel,
  failedAt,
}: PublicationErrorDialogProps) => {
  const { copied, copy, reset } = useCopyToClipboard();

  const description = joinTruthy([
    productTitle,
    accountLabel,
    failedAt ? format(failedAt, "d MMM yyyy, HH:mm") : null,
  ]);

  return (
    <Dialog onOpenChange={() => reset()}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-destructive underline-offset-4 hover:underline"
        >
          <TriangleAlert className="size-3" />
          View reason
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Publish failed</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ScrollArea className="max-h-72 rounded-md border bg-muted/40 p-3">
          <Typography
            variant="muted"
            as="pre"
            className="text-xs break-words whitespace-pre-wrap text-destructive"
          >
            {errorMessage}
          </Typography>
        </ScrollArea>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => copy(errorMessage)}
        >
          {copied ? <Check className="text-emerald-500" /> : <Copy />}
          {copied ? "Copied" : "Copy error"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
