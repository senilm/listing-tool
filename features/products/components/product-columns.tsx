"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CopyPlus, Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { TruncatedText } from "@/components/truncated-text";
import { ProductPublishButton } from "@/features/products/components/product-publish-button";
import { type ProductSummary } from "@/features/products/services/product-service";

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
  onSellSimilar: (product: ProductSummary) => void;
  onDelete: (product: ProductSummary) => void;
  onPublish: (product: ProductSummary) => void;
};

export const createProductColumns = ({
  onEdit,
  onSellSimilar,
  onDelete,
  onPublish,
}: ProductColumnHandlers): ColumnDef<ProductSummary>[] => [
  {
    accessorKey: "title",
    meta: { label: "Title" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <TruncatedText className="font-medium">
        {row.original.title}
      </TruncatedText>
    ),
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
    id: "publish",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <ProductPublishButton product={row.original} onPublish={onPublish} />
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
          { label: "Sell similar", icon: CopyPlus, onSelect: onSellSimilar },
          {
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onSelect: onDelete,
            separatorBefore: true,
          },
        ]}
      />
    ),
  },
];
