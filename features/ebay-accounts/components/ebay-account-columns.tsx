"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, RefreshCw, Unplug } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { type DataTableRowAction } from "@/components/data-table/data-table.types";
import { TruncatedText } from "@/components/truncated-text";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { ebayAccountConnectApiRoute } from "@/lib/api-routes";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

type EbayAccountColumnHandlers = {
  onRename: (account: EbayAccountSummary) => void;
  onDisconnect: (account: EbayAccountSummary) => void;
};

export const createEbayAccountColumns = ({
  onRename,
  onDisconnect,
}: EbayAccountColumnHandlers): ColumnDef<EbayAccountSummary>[] => [
  {
    accessorKey: "label",
    meta: { label: "Label" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Label" />
    ),
    cell: ({ row }) => (
      <TruncatedText className="font-medium">
        {row.original.label}
      </TruncatedText>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <EbayAccountStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    meta: { label: "Connected" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Connected" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {format(new Date(row.original.createdAt), "d MMM yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      const actions: DataTableRowAction<EbayAccountSummary>[] = [
        { label: "Rename", icon: Pencil, onSelect: onRename },
      ];
      if (row.original.status === EbayAccountStatus.NeedsReconsent) {
        actions.push({
          label: "Reconnect",
          icon: RefreshCw,
          href: () => ebayAccountConnectApiRoute(),
        });
      }
      actions.push({
        label: "Disconnect",
        icon: Unplug,
        variant: "destructive",
        onSelect: onDisconnect,
      });
      return <DataTableRowActions row={row.original} actions={actions} />;
    },
  },
];
