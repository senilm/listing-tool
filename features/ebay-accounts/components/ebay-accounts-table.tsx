"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ebayAccountConnectApiRoute } from "@/lib/api-routes";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { useTableParams } from "@/hooks/use-table-params";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { createEbayAccountColumns } from "@/features/ebay-accounts/components/ebay-account-columns";
import { RenameEbayAccountDialog } from "@/features/ebay-accounts/components/rename-ebay-account-dialog";
import { DisconnectEbayAccountDialog } from "@/features/ebay-accounts/components/disconnect-ebay-account-dialog";
import { useEbayAccountsQuery } from "@/features/ebay-accounts/hooks/use-ebay-accounts-query";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";

const FILTER_KEYS = ["status"];

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: DataTableFilterType.MultiSelect,
    options: [
      { label: "Active", value: EbayAccountStatus.Active },
      { label: "Needs reconsent", value: EbayAccountStatus.NeedsReconsent },
      { label: "Disabled", value: EbayAccountStatus.Disabled },
    ],
  },
];

export const EbayAccountsTable = () => {
  const params = useTableParams({ filterKeys: FILTER_KEYS });
  const { data, isLoading, isFetching } = useEbayAccountsQuery(params.apiParams);

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
        filterFields={FILTER_FIELDS}
        enableGlobalFilter
        searchPlaceholder="Search by label or username"
        isLoading={isLoading || isFetching}
        emptyTitle="No eBay accounts linked"
        emptyDescription="Connect an eBay seller account to start listing."
        toolbarActions={
          <Button asChild size="sm">
            <Link href={ebayAccountConnectApiRoute()}>
              <Plus />
              Connect account
            </Link>
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
