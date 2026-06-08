import { Skeleton } from "@/components/ui/skeleton";

type AuthFieldSkeletonProps = {
  labelWidth?: string;
  descriptionLineWidths?: string[];
};

export const AuthFieldSkeleton = ({
  labelWidth = "w-16",
  descriptionLineWidths,
}: AuthFieldSkeletonProps) => (
  <div className="flex w-full flex-col gap-2">
    <div className="flex h-[19.25px] items-center">
      <Skeleton className={`h-3.5 ${labelWidth}`} />
    </div>
    <Skeleton className="h-9 w-full rounded-lg" />
    {descriptionLineWidths ? (
      <div className="flex flex-col">
        {descriptionLineWidths.map((width, index) => (
          <div key={index} className="flex h-5.25 items-center">
            <Skeleton className={`h-3 ${width}`} />
          </div>
        ))}
      </div>
    ) : null}
  </div>
);
