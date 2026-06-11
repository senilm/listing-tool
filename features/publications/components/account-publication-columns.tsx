"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { TruncatedText } from "@/components/truncated-text";
import { Typography } from "@/components/typography";
import { PublicationStatusBadge } from "@/features/publications/components/publication-status-badge";
import { type PublicationSummary } from "@/features/publications/services/publication-service";

// Columns for the account detail page — every row belongs to the same
// account, so there is no Account column.
export const createAccountPublicationColumns =
  (): ColumnDef<PublicationSummary>[] => [
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
      accessorKey: "status",
      meta: { label: "Status" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <PublicationStatusBadge status={row.original.status} />
          {row.original.errorMessage ? (
            <Typography variant="muted" className="text-xs text-destructive">
              <TruncatedText>{row.original.errorMessage}</TruncatedText>
            </Typography>
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
