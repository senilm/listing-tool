import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationsTable } from "@/features/publications/components/publications-table";

const PublicationsPage = () => {
  return (
    <>
      <PageHeader
        title="Publications"
        description="Per-account publish records."
      />

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <PublicationsTable />
      </Suspense>
    </>
  );
};

export default PublicationsPage;
