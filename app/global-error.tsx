"use client";

import "./globals.css";

// Replaces the root layout when it fails — must render its own <html>/<body>
// and stay dependency-free beyond global styles.
type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

const GlobalError = ({ error, unstable_retry }: GlobalErrorProps) => {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {!!error.digest && (
              <p className="text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
