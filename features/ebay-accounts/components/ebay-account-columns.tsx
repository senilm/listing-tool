"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Unplug } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { TruncatedText } from "@/components/truncated-text";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
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
      <TruncatedText className="font-medium">{row.original.label}</TruncatedText>
    ),
  },
  {
    accessorKey: "ebayUsername",
    meta: { label: "eBay username" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="eBay username" />
    ),
    cell: ({ row }) =>
      row.original.ebayUsername ? (
        <TruncatedText>{row.original.ebayUsername}</TruncatedText>
      ) : (
        <span className="text-muted-foreground">—</span>
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
    cell: ({ row }) => (
      <DataTableRowActions
        row={row.original}
        actions={[
          { label: "Rename", icon: Pencil, onSelect: onRename },
          {
            label: "Disconnect",
            icon: Unplug,
            variant: "destructive",
            onSelect: onDisconnect,
            disabled: (account) =>
              account.status === EbayAccountStatus.Disabled,
          },
        ]}
      />
    ),
  },
];
