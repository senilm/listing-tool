import { Suspense } from "react";

import { DataTableFallback } from "@/components/data-table/data-table-fallback";
import { PageHeader } from "@/components/page-header";
import { PublicationsTable } from "@/features/publications/components/publications-table";

const PublicationsPage = () => {
  return (
    <>
      <PageHeader
        title="Publications"
        description="Per-account publish records."
      />

      <Suspense fallback={<DataTableFallback />}>
        <PublicationsTable />
      </Suspense>
    </>
  );
};

export default PublicationsPage;
