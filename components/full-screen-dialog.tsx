"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";

export const FullScreenDialogContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
    <DialogPrimitive.Content
      className={cn(
        "bg-background fixed inset-4 max-sm:inset-2 z-50 flex flex-col rounded-xl border shadow-lg outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] duration-200",
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
      "flex items-start justify-between border-b px-6 py-4 shrink-0",
      className,
    )}
    {...props}
  >
    <div className="flex-1 min-w-0 flex flex-col gap-1">{children}</div>
    {showCloseButton && (
      <DialogPrimitive.Close className="mt-0.5 shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:outline-hidden cursor-pointer">
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
  <div className={cn("flex-1 overflow-y-auto px-6 py-6", className)} {...props} />
);

export const FullScreenDialogFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex items-center justify-end gap-2 border-t px-6 py-4 shrink-0",
      className,
    )}
    {...props}
  />
);
