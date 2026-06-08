import { toast } from "sonner";

export { toast };

export const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong";

type ToastMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error?: string | ((error: unknown) => string);
};

// Drives a sonner toast off a promise (loading → success/error) and resolves
// the same promise, so callers can await the underlying work.
export const withToast = <T>(
  promise: Promise<T>,
  messages: ToastMessages<T>,
): Promise<T> => {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error ?? toErrorMessage,
  });
  return promise;
};
