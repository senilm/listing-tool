"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { createProductColumns } from "@/features/products/components/product-columns";
import { useDeleteProduct } from "@/features/products/hooks/use-product-mutations";
import { useProductsQuery } from "@/features/products/hooks/use-products-query";
import { type ProductSummary } from "@/features/products/services/product-service";
import { PublishFlowModal } from "@/features/publications/components/publish-flow-modal";
import { useTableParams } from "@/hooks/use-table-params";
import { productCreateRoute, productDetailRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";

export const ProductsTable = () => {
  const router = useRouter();
  const params = useTableParams();
  const { data, isLoading, isFetching, refetch } = useProductsQuery(
    params.apiParams,
  );
  const deleteProduct = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null);
  const [publishTarget, setPublishTarget] = useState<ProductSummary | null>(
    null,
  );

  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: (product) => router.push(productDetailRoute(product.id)),
        onDelete: (product) => setDeleteTarget(product),
        onPublish: (product) => setPublishTarget(product),
      }),
    [router],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete the product");
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
        globalFilter={params.globalFilter}
        onGlobalFilterChange={params.onGlobalFilterChange}
        enableGlobalFilter
        searchPlaceholder="Search by title"
        isLoading={isLoading || isFetching}
        onRefresh={() => void refetch()}
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
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          deleteTarget ? `Delete ${deleteTarget.title}?` : "Delete product?"
        }
        description="Deleting removes the product from your list. Its existing publications stay intact."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteProduct.isPending}
        onConfirm={() => void handleDelete()}
      />

      <PublishFlowModal
        product={publishTarget}
        open={publishTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPublishTarget(null);
        }}
      />
    </>
  );
};
