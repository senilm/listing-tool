"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { StatusBadge } from "@/components/status-badge";
import { TruncatedText } from "@/components/truncated-text";
import { PublicationErrorDialog } from "@/features/publications/components/publication-error-dialog";
import { PublicationStatusBadge } from "@/features/publications/components/publication-status-badge";
import { type PublicationSummary } from "@/features/publications/services/publication-service";

// A scheduled listing is one eBay has accepted but not yet launched, so its
// scheduled time is still in the future.
const isAwaitingLaunch = (publication: PublicationSummary): boolean =>
  publication.scheduledAt
    ? new Date(publication.scheduledAt).getTime() > Date.now()
    : false;

export const createPublicationColumns = (): ColumnDef<PublicationSummary>[] => [
  {
    accessorKey: "productTitle",
    meta: { label: "Product" },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <TruncatedText className="font-medium">
        {row.original.productTitle}
      </TruncatedText>
    ),
  },
  {
    accessorKey: "accountLabel",
    meta: { label: "Account" },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    cell: ({ row }) => (
      <TruncatedText>{row.original.accountLabel}</TruncatedText>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <PublicationStatusBadge status={row.original.status} />
        {isAwaitingLaunch(row.original) ? (
          <StatusBadge variant="info">Scheduled</StatusBadge>
        ) : null}
        {row.original.errorMessage ? (
          <PublicationErrorDialog
            errorMessage={row.original.errorMessage}
            productTitle={row.original.productTitle}
            accountLabel={row.original.accountLabel}
            failedAt={row.original.publishedAt}
          />
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "publishedAt",
    meta: { label: "Published" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.publishedAt
          ? format(new Date(row.original.publishedAt), "d MMM yyyy")
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "scheduledAt",
    meta: { label: "Goes live" },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Goes live" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.scheduledAt
          ? format(new Date(row.original.scheduledAt), "d MMM yyyy, HH:mm")
          : "—"}
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
          {
            label: "View on eBay",
            icon: ExternalLink,
            onSelect: (publication) => {
              if (publication.viewUrl) {
                window.open(
                  publication.viewUrl,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            },
            disabled: (publication) => !publication.viewUrl,
          },
        ]}
      />
    ),
  },
];
