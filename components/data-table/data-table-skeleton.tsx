import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

type DataTableSkeletonProps = {
  columns: number;
  rows?: number;
};

export const DataTableSkeleton = ({
  columns,
  rows = 8,
}: DataTableSkeletonProps) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, cellIndex) => (
          <TableCell key={cellIndex}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);
