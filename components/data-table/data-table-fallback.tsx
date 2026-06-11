import { Skeleton } from "@/components/ui/skeleton";

// Suspense fallback mirroring the DataTable layout — toolbar, table block and
// pagination row — so the page doesn't jump when the real table mounts.
export const DataTableFallback = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-full sm:w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="size-8" />
      </div>
    </div>

    <Skeleton className="min-h-0 flex-1 rounded-lg" />

    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-5 w-20" />
      <div className="flex items-center gap-4 lg:gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-56" />
      </div>
    </div>
  </div>
);
