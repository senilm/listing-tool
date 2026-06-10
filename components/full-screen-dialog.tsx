"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

export { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";

export const FullScreenDialogContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      className={cn(
        "fixed inset-4 z-50 flex flex-col rounded-xl border bg-background shadow-lg outline-none max-sm:inset-2",
        "duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const FullScreenDialogHeader = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) => (
  <div
    className={cn(
      "flex shrink-0 items-start justify-between border-b px-6 py-4",
      className,
    )}
    {...props}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
    {!!showCloseButton && (
      <DialogPrimitive.Close className="mt-0.5 shrink-0 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <XIcon className="size-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    )}
  </div>
);

export const FullScreenDialogBody = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("flex-1 overflow-y-auto px-6 py-6", className)}
    {...props}
  />
);

export const FullScreenDialogFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4",
      className,
    )}
    {...props}
  />
);
