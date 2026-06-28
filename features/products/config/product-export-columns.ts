import { format } from "date-fns";

import { type ProductSummary } from "@/features/products/services/product-service";
import { type CategoryId } from "@/lib/categories/category-id";
import { CATEGORY_REGISTRY } from "@/lib/categories/registry";
import { type ExportColumn } from "@/lib/export/types";

// Dates arrive as ISO strings over JSON, so coerce before formatting.
const dateCell = (value: Date | string | null): string | null =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : null;

const categoryLabel = (categoryId: string): string =>
  CATEGORY_REGISTRY[categoryId as CategoryId]?.label ?? categoryId;

// `id` matches the products table column ids so the export tracks column
// visibility; headers mirror the on-screen titles.
export const PRODUCT_EXPORT_COLUMNS: ExportColumn<ProductSummary>[] = [
  { id: "title", header: "Title", value: (row) => row.title },
  {
    id: "categoryId",
    header: "Category",
    value: (row) => categoryLabel(row.categoryId),
  },
  { id: "basePrice", header: "Price", value: (row) => Number(row.basePrice) },
  { id: "quantity", header: "Qty", value: (row) => row.quantity },
  {
    id: "updatedAt",
    header: "Updated",
    value: (row) => dateCell(row.updatedAt),
  },
];
