import { useCallback, useEffect, useRef, useState } from "react";

type UseCopyToClipboardOptions = {
  // How long the `copied` flag stays true before resetting, in ms.
  resetDelay?: number;
};

type UseCopyToClipboard = {
  copied: boolean;
  copy: (value: string) => void;
  reset: () => void;
};

// Writes text to the clipboard and exposes a transient `copied` flag that
// flips back to false after `resetDelay`.
export const useCopyToClipboard = ({
  resetDelay = 1500,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboard => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
  }, [clearTimer]);

  const copy = useCallback(
    (value: string) => {
      void navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimer();
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    },
    [clearTimer, resetDelay],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { copied, copy, reset };
};
