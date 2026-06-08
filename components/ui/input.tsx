import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  onKeyDown,
  onWheel,
  ...props
}: React.ComponentProps<"input">) {
  // Block "-" and "e" on non-negative number inputs.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      type === "number" &&
      props.min !== undefined &&
      Number(props.min) >= 0 &&
      (event.key === "-" || event.key === "e")
    ) {
      event.preventDefault()
    }
    onKeyDown?.(event)
  }

  // Stop scroll-wheel from silently changing a number value.
  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    if (type === "number") {
      event.currentTarget.blur()
    }
    onWheel?.(event)
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        type === "number" &&
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      {...props}
    />
  )
}

export { Input }
