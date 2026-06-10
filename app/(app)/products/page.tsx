import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsTable } from "@/features/products/components/products-table";

const ProductsPage = () => {
  return (
    <>
      <PageHeader
        title="Products"
        description="Your master jewellery listings."
      />
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <ProductsTable />
      </Suspense>
    </>
  );
};

export default ProductsPage;
