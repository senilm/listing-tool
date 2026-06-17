// A single exported column. `id` matches the table's column id so the export
// can be filtered down to whatever columns are currently visible. Numbers stay
// numeric so spreadsheets treat them as numbers; null/empty renders blank.
export type ExportCell = string | number | null;

export type ExportColumn<TRow> = {
  id: string;
  header: string;
  value: (row: TRow) => ExportCell;
};

// Shape the export endpoints return: the (capped) rows plus the unclamped total
// and whether the cap kicked in, so the client can warn about truncation.
export type ExportResult<TRow> = {
  items: TRow[];
  total: number;
  truncated: boolean;
};

// Hard ceiling on exported rows — guards against pulling an unbounded result
// set into memory and the browser. Mirrors GPMS's export cap.
export const EXPORT_ROW_LIMIT = 10_000;
