import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardStatsCardSkeleton } from "@/features/dashboard/components/dashboard-stats-card-skeleton";

export const DashboardOverviewSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <DashboardStatsCardSkeleton key={index} />
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b px-4 py-3">
          <div className="flex h-3.5 items-center">
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <CardContent className="px-4 py-4">
          <div className="mx-auto flex aspect-square max-h-[240px] items-center justify-center">
            <Skeleton className="size-[200px] rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex h-4 items-center">
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="h-3.5 w-14" />
        </div>
        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-3.5 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-3.5 w-14" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-3.5 w-8" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-3.5 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-6" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Recent activity */}
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex h-4 items-center">
          <Skeleton className="h-3.5 w-28" />
        </div>
        <Skeleton className="h-3.5 w-12" />
      </div>
      <CardContent className="px-0 py-0">
        <ul className="divide-y">
          {Array.from({ length: 8 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex h-5 items-center">
                  <Skeleton className="h-3.5 w-40" />
                </div>
                <div className="flex h-4 items-center">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="hidden h-3 w-24 sm:block" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </div>
);
