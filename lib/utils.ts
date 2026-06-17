import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Drops null/undefined/empty/false parts and joins the rest with `separator`.
export const joinTruthy = (
  parts: ReadonlyArray<string | null | undefined | false>,
  separator = " · ",
): string => parts.filter(Boolean).join(separator);
