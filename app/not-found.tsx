import { SearchX } from "lucide-react";
import Link from "next/link";

import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { homeRoute } from "@/lib/routes";

const NotFound = () => {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <SearchX className="size-12 text-muted-foreground/40" />
      <div className="space-y-1 text-center">
        <Typography variant="h3" as="h1">
          Page not found
        </Typography>
        <Typography variant="muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
      </div>
      <Button asChild>
        <Link href={homeRoute()}>Go back home</Link>
      </Button>
    </main>
  );
};

export default NotFound;
