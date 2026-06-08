import type { KeyboardEvent } from "react";

// Blocks the minus key (unless allowNegative) plus the exponent/plus chars that
// <input type="number"> otherwise accepts (e.g. "1e3", "+5").
export const blockNegativeKeyDown = (
  event: KeyboardEvent<HTMLInputElement>,
  allowNegative = false,
): void => {
  const blocked =
    event.key === "e" ||
    event.key === "E" ||
    event.key === "+" ||
    (!allowNegative && event.key === "-");
  if (blocked) event.preventDefault();
};
