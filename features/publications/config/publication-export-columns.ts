import { format } from "date-fns";

import { type PublicationSummary } from "@/features/publications/services/publication-service";
import { type ExportColumn } from "@/lib/export/types";

// Dates arrive as ISO strings over JSON, so coerce before formatting.
const dateCell = (value: Date | string | null): string | null =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : null;

// `id` matches the publications table column ids so the export tracks column
// visibility. The account detail table has no "accountLabel" column, so that
// entry simply drops out there.
export const PUBLICATION_EXPORT_COLUMNS: ExportColumn<PublicationSummary>[] = [
  { id: "productTitle", header: "Product", value: (row) => row.productTitle },
  { id: "accountLabel", header: "Account", value: (row) => row.accountLabel },
  { id: "status", header: "Status", value: (row) => row.status },
  {
    id: "publishedAt",
    header: "Published",
    value: (row) => dateCell(row.publishedAt),
  },
];
