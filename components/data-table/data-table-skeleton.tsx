import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

type DataTableSkeletonProps = {
  columns: number;
  rows?: number;
};

export const DataTableSkeletonRows = ({
  columns,
  rows = 8,
}: DataTableSkeletonProps) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, cellIndex) => (
          <TableCell key={cellIndex}>
            <div className="flex h-8 items-center">
              <Skeleton className="h-5 w-full" />
            </div>
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
