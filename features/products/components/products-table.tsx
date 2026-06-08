"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { productCreateRoute, productDetailRoute } from "@/lib/routes";
import { ProductStatus } from "@/lib/enums/product";
import { toast } from "@/lib/toast";
import { useTableParams } from "@/hooks/use-table-params";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createProductColumns } from "@/features/products/components/product-columns";
import { useProductsQuery } from "@/features/products/hooks/use-products-query";
import { useArchiveProduct } from "@/features/products/hooks/use-product-mutations";
import { type ProductSummary } from "@/features/products/services/product-service";

const FILTER_KEYS = ["status"];

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: DataTableFilterType.MultiSelect,
    options: [
      { label: "Active", value: ProductStatus.Active },
      { label: "Archived", value: ProductStatus.Archived },
    ],
  },
];

export const ProductsTable = () => {
  const router = useRouter();
  const params = useTableParams({ filterKeys: FILTER_KEYS });
  const { data, isLoading, isFetching } = useProductsQuery(params.apiParams);
  const archiveProduct = useArchiveProduct();

  const [archiveTarget, setArchiveTarget] = useState<ProductSummary | null>(null);

  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: (product) => router.push(productDetailRoute(product.id)),
        onArchive: (product) => setArchiveTarget(product),
      }),
    [router],
  );

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveProduct.mutateAsync(archiveTarget.id);
      toast.success("Product archived");
      setArchiveTarget(null);
    } catch {
      toast.error("Could not archive the product");
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        pagination={{
          page: params.page,
          limit: params.limit,
          total: data?.total ?? 0,
        }}
        onPageChange={params.onPageChange}
        onLimitChange={params.onLimitChange}
        sorting={params.sorting}
        onSortingChange={params.onSortingChange}
        columnFilters={params.columnFilters}
        onColumnFiltersChange={params.onColumnFiltersChange}
        globalFilter={params.globalFilter}
        onGlobalFilterChange={params.onGlobalFilterChange}
        filterFields={FILTER_FIELDS}
        enableGlobalFilter
        searchPlaceholder="Search by title or SKU"
        isLoading={isLoading || isFetching}
        emptyTitle="No products yet"
        emptyDescription="Create your first master listing to get started."
        onRowClick={(row) => router.push(productDetailRoute(row.id))}
        toolbarActions={
          <Button asChild size="sm">
            <Link href={productCreateRoute()}>
              <Plus />
              New product
            </Link>
          </Button>
        }
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title={archiveTarget ? `Archive ${archiveTarget.title}?` : "Archive product?"}
        description="Archiving hides the product from your active list. Its existing publications stay intact, and you can restore it later."
        confirmLabel="Archive"
        variant="destructive"
        isLoading={archiveProduct.isPending}
        onConfirm={handleArchive}
      />
    </>
  );
};
