"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { DisconnectEbayAccountDialog } from "@/features/ebay-accounts/components/disconnect-ebay-account-dialog";
import { createEbayAccountColumns } from "@/features/ebay-accounts/components/ebay-account-columns";
import { RenameEbayAccountDialog } from "@/features/ebay-accounts/components/rename-ebay-account-dialog";
import { EBAY_ACCOUNT_EXPORT_COLUMNS } from "@/features/ebay-accounts/config/ebay-account-export-columns";
import {
  EBAY_ACCOUNT_FILTER_FIELDS,
  EBAY_ACCOUNT_FILTER_KEYS,
} from "@/features/ebay-accounts/config/ebay-account-filters";
import { useEbayAccountsQuery } from "@/features/ebay-accounts/hooks/use-ebay-accounts-query";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { useTableParams } from "@/hooks/use-table-params";
import {
  ebayAccountConnectApiRoute,
  ebayAccountsExportApiRoute,
} from "@/lib/api-routes";
import { ebayAccountDetailRoute } from "@/lib/routes";

export const EbayAccountsTable = () => {
  const router = useRouter();
  const params = useTableParams({ filterKeys: EBAY_ACCOUNT_FILTER_KEYS });
  const { data, isLoading, isFetching, refetch } = useEbayAccountsQuery(
    params.apiParams,
  );

  const [renameTarget, setRenameTarget] = useState<EbayAccountSummary | null>(
    null,
  );
  const [disconnectTarget, setDisconnectTarget] =
    useState<EbayAccountSummary | null>(null);

  const columns = useMemo(
    () =>
      createEbayAccountColumns({
        onRename: setRenameTarget,
        onDisconnect: setDisconnectTarget,
      }),
    [],
  );

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
        filterFields={EBAY_ACCOUNT_FILTER_FIELDS}
        enableGlobalFilter
        searchPlaceholder="Search by label"
        isLoading={isLoading || isFetching}
        onRefresh={() => void refetch()}
        exportConfig={{
          route: ebayAccountsExportApiRoute(),
          apiParams: params.apiParams,
          fileName: "ebay-accounts",
          columns: EBAY_ACCOUNT_EXPORT_COLUMNS,
        }}
        emptyTitle="No eBay accounts linked"
        emptyDescription="Connect an eBay seller account to start listing."
        onRowClick={(row) => router.push(ebayAccountDetailRoute(row.id))}
        toolbarActions={
          <Button asChild size="sm">
            <a href={ebayAccountConnectApiRoute()}>
              <Plus />
              Connect account
            </a>
          </Button>
        }
      />

      <RenameEbayAccountDialog
        id={renameTarget?.id ?? ""}
        currentLabel={renameTarget?.label ?? ""}
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />

      <DisconnectEbayAccountDialog
        id={disconnectTarget?.id ?? ""}
        label={disconnectTarget?.label ?? ""}
        open={disconnectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null);
        }}
      />
    </>
  );
};
