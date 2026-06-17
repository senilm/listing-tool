"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { createPublicationColumns } from "@/features/publications/components/publication-columns";
import {
  PUBLICATION_FILTER_FIELDS,
  PUBLICATION_FILTER_KEYS,
} from "@/features/publications/config/publication-filters";
import { usePublicationsQuery } from "@/features/publications/hooks/use-publications-query";
import { useTableParams } from "@/hooks/use-table-params";

export const PublicationsTable = () => {
  const params = useTableParams({ filterKeys: PUBLICATION_FILTER_KEYS });
  const { data, isLoading, isFetching, refetch } = usePublicationsQuery(
    params.apiParams,
  );

  const columns = useMemo(() => createPublicationColumns(), []);

  return (
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
      filterFields={PUBLICATION_FILTER_FIELDS}
      enableGlobalFilter
      searchPlaceholder="Search by product title"
      isLoading={isLoading || isFetching}
      onRefresh={() => void refetch()}
      emptyTitle="No publications yet"
      emptyDescription="Publish a product to an eBay account to see it here."
    />
  );
};
