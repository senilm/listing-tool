import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { ProductStatus } from "@/lib/enums/product";

export const PRODUCT_FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: DataTableFilterType.MultiSelect,
    options: [
      { label: "Active", value: ProductStatus.Active },
      { label: "Archived", value: ProductStatus.Archived },
    ],
  },
];

// Module-level (stable) — useTableParams expects a stable filterKeys array.
export const PRODUCT_FILTER_KEYS = PRODUCT_FILTER_FIELDS.map(
  (field) => field.id,
);
