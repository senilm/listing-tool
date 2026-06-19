import {
  DataTableFilterType,
  type DataTableFilterField,
} from "@/components/data-table/data-table.types";
import { PublicationStatus } from "@/lib/enums/publication";

export const PUBLICATION_FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: DataTableFilterType.MultiSelect,
    options: [
      { label: "Published", value: PublicationStatus.Published },
      { label: "Failed", value: PublicationStatus.Failed },
    ],
  },
];

// Module-level (stable) — useTableParams expects a stable filterKeys array.
export const PUBLICATION_FILTER_KEYS = PUBLICATION_FILTER_FIELDS.map(
  (field) => field.id,
);
