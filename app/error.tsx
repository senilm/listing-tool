"use client";

import { TriangleAlert } from "lucide-react";

import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

const ErrorPage = ({ error, unstable_retry }: ErrorPageProps) => {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <TriangleAlert className="size-12 text-muted-foreground/40" />
      <div className="space-y-1 text-center">
        <Typography variant="h3" as="h1">
          Something went wrong
        </Typography>
        <Typography variant="muted">
          An unexpected error occurred. Please try again.
        </Typography>
        {!!error.digest && (
          <Typography variant="muted">Error ID: {error.digest}</Typography>
        )}
      </div>
      <Button onClick={() => unstable_retry()}>Try again</Button>
    </main>
  );
};

export default ErrorPage;
