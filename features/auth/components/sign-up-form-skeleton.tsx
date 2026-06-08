import { Skeleton } from "@/components/ui/skeleton";
import { AuthFieldSkeleton } from "@/features/auth/components/auth-field-skeleton";

export const SignUpFormSkeleton = () => (
  <>
    <div className="flex flex-col gap-1.5">
      <div className="flex h-8 items-center">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex h-5 items-center">
        <Skeleton className="h-3.5 w-44" />
      </div>
    </div>

    <div className="flex flex-col gap-6">
      <div className="flex w-full flex-col gap-5">
        <AuthFieldSkeleton labelWidth="w-12" />
        <AuthFieldSkeleton labelWidth="w-12" />
        <AuthFieldSkeleton
          labelWidth="w-20"
          descriptionLineWidths={["w-full", "w-full", "w-1/3"]}
        />
        <AuthFieldSkeleton labelWidth="w-32" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>

    <div className="flex h-5 items-center justify-center">
      <Skeleton className="h-3.5 w-52" />
    </div>
  </>
);
