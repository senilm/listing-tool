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
      { label: "Publishing", value: PublicationStatus.Publishing },
      { label: "Published", value: PublicationStatus.Published },
      { label: "Failed", value: PublicationStatus.Failed },
      { label: "Draft", value: PublicationStatus.Draft },
      { label: "Scheduled", value: PublicationStatus.Scheduled },
      { label: "Ended", value: PublicationStatus.Ended },
    ],
  },
];

// Module-level (stable) — useTableParams expects a stable filterKeys array.
export const PUBLICATION_FILTER_KEYS = PUBLICATION_FILTER_FIELDS.map(
  (field) => field.id,
);
