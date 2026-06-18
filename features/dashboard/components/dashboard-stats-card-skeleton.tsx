import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStatsCardSkeleton = () => (
  <Card className="relative gap-0 overflow-hidden py-0">
    <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex h-4 items-center">
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex h-8 items-center">
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="flex h-4 items-center">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="size-9 shrink-0 rounded-lg" />
    </CardContent>
  </Card>
);
