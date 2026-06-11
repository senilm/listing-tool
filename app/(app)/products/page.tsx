import { Suspense } from "react";

import { DataTableFallback } from "@/components/data-table/data-table-fallback";
import { PageHeader } from "@/components/page-header";
import { ProductsTable } from "@/features/products/components/products-table";

const ProductsPage = () => {
  return (
    <>
      <PageHeader
        title="Products"
        description="Your master jewellery listings."
      />
      <Suspense fallback={<DataTableFallback />}>
        <ProductsTable />
      </Suspense>
    </>
  );
};

export default ProductsPage;
