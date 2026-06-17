import { format } from "date-fns";

import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { type ExportColumn } from "@/lib/export/types";

// Dates arrive as ISO strings over JSON, so coerce before formatting.
const dateCell = (value: Date | string | null): string | null =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : null;

// `id` matches the eBay accounts table column ids so the export tracks column
// visibility; the token column is never selected, so it can't leak here.
export const EBAY_ACCOUNT_EXPORT_COLUMNS: ExportColumn<EbayAccountSummary>[] = [
  { id: "label", header: "Label", value: (row) => row.label },
  { id: "status", header: "Status", value: (row) => row.status },
  {
    id: "createdAt",
    header: "Connected",
    value: (row) => dateCell(row.createdAt),
  },
];
