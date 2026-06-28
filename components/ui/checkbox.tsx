"use client"

import * as React from "react"
import { motion, type HTMLMotionProps, type SVGMotionProps } from "motion/react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"
import { cn } from "@/lib/utils"

type CheckboxContextType = {
  isChecked: boolean | "indeterminate"
  setIsChecked: (checked: boolean | "indeterminate") => void
}

const [CheckboxProvider, useCheckbox] =
  getStrictContext<CheckboxContextType>("CheckboxContext")

type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>

function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const { isChecked } = useCheckbox()

  return (
    <CheckboxPrimitive.Indicator forceMount asChild>
      <motion.svg
        data-slot="checkbox-indicator"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3.5"
        stroke="currentColor"
        initial="unchecked"
        animate={isChecked ? "checked" : "unchecked"}
        {...props}
      >
        {isChecked === "indeterminate" ? (
          <motion.line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.2 },
            }}
          />
        ) : (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
            variants={{
              checked: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.2, delay: 0.2 },
              },
              unchecked: {
                pathLength: 0,
                opacity: 0,
                transition: { duration: 0.2 },
              },
            }}
          />
        )}
      </motion.svg>
    </CheckboxPrimitive.Indicator>
  )
}

type CheckboxProps = HTMLMotionProps<"button"> &
  Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "asChild">

function Checkbox({
  className,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  children,
  ...props
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  return (
    <CheckboxProvider value={{ isChecked, setIsChecked }}>
      <CheckboxPrimitive.Root
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={setIsChecked}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        asChild
      >
        <motion.button
          data-slot="checkbox"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
          <CheckboxIndicator className="size-3.5" />
        </motion.button>
      </CheckboxPrimitive.Root>
    </CheckboxProvider>
  )
}

export { Checkbox, type CheckboxProps }
