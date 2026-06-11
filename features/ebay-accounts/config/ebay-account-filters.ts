import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

export const EBAY_ACCOUNT_FILTER_FIELDS: DataTableFilterField[] = [
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

// Module-level (stable) — useTableParams expects a stable filterKeys array.
export const EBAY_ACCOUNT_FILTER_KEYS = EBAY_ACCOUNT_FILTER_FIELDS.map(
  (field) => field.id,
);
