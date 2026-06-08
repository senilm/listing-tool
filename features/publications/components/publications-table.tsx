"use client";

import { useMemo } from "react";

import { PublicationStatus } from "@/lib/enums/publication";
import { useTableParams } from "@/hooks/use-table-params";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { createPublicationColumns } from "@/features/publications/components/publication-columns";
import { usePublicationsQuery } from "@/features/publications/hooks/use-publications-query";

const FILTER_KEYS = ["status"];

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: DataTableFilterType.MultiSelect,
    options: [
      { label: "Publishing", value: PublicationStatus.Publishing },
      { label: "Published", value: PublicationStatus.Published },
      { label: "Failed", value: PublicationStatus.Failed },
      { label: "Draft", value: PublicationStatus.Draft },
      { label: "Scheduled", value: PublicationStatus.Scheduled },
      { label: "Ended", value: PublicationStatus.Ended },
    ],
  },
];

export const PublicationsTable = () => {
  const params = useTableParams({ filterKeys: FILTER_KEYS });
  const { data, isLoading, isFetching } = usePublicationsQuery(params.apiParams);

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
      filterFields={FILTER_FIELDS}
      enableGlobalFilter
      searchPlaceholder="Search by product title"
      isLoading={isLoading || isFetching}
      emptyTitle="No publications yet"
      emptyDescription="Publish a product to an eBay account to see it here."
    />
  );
};
