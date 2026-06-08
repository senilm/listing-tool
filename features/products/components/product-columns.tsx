"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Archive, Pencil, Upload } from "lucide-react";

import { ProductStatus } from "@/lib/enums/product";
import { type ProductSummary } from "@/features/products/services/product-service";
import { Typography } from "@/components/typography";
import { TruncatedText } from "@/components/truncated-text";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ProductStatusBadge } from "@/features/products/components/product-status-badge";

const formatPrice = (amount: string, currency: string): string => {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
};

type ProductColumnHandlers = {
  onEdit: (product: ProductSummary) => void;
  onArchive: (product: ProductSummary) => void;
  onPublish: (product: ProductSummary) => void;
};

export const createProductColumns = ({
  onEdit,
  onArchive,
  onPublish,
}: ProductColumnHandlers): ColumnDef<ProductSummary>[] => [
  {
    accessorKey: "title",
    meta: { label: "Title" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <TruncatedText className="font-medium">
          {row.original.title}
        </TruncatedText>
        {row.original.sku ? (
          <Typography variant="muted" className="text-xs">
            {row.original.sku}
          </Typography>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "basePrice",
    meta: { label: "Price" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatPrice(row.original.basePrice, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    meta: { label: "Qty" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.quantity}</span>
    ),
  },
  {
    accessorKey: "updatedAt",
    meta: { label: "Updated" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {format(new Date(row.original.updatedAt), "d MMM yyyy")}
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
          { label: "Edit", icon: Pencil, onSelect: onEdit },
          {
            label: "Publish",
            icon: Upload,
            onSelect: onPublish,
            disabled: (product) => product.status === ProductStatus.Archived,
          },
          {
            label: "Archive",
            icon: Archive,
            variant: "destructive",
            onSelect: onArchive,
            separatorBefore: true,
            disabled: (product) => product.status === ProductStatus.Archived,
          },
        ]}
      />
    ),
  },
];
