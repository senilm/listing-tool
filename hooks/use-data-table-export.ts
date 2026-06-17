"use client";

import { type Table } from "@tanstack/react-table";
import { saveAs } from "file-saver";
import { useCallback, useState } from "react";

import { ExportFormat } from "@/lib/enums/export";
import { toCsv } from "@/lib/export/to-csv";
import { toXlsx } from "@/lib/export/to-xlsx";
import {
  EXPORT_ROW_LIMIT,
  type ExportColumn,
  type ExportResult,
} from "@/lib/export/types";
import { toast } from "@/lib/toast";

const CSV_MIME = "text/csv;charset=utf-8";

export type DataTableExportConfig<TRow> = {
  // Export endpoint returning ExportResult<TRow> for the current filters/sort.
  route: string;
  // Current table query string (filters/search/sort); pagination is ignored.
  apiParams: string;
  // Base file name without extension or date.
  fileName: string;
  // Keyed by table column id; only currently-visible columns are exported.
  columns: ExportColumn<TRow>[];
};

export type DataTableExportControls = {
  isExporting: boolean;
  // True when no exportable column is visible — nothing to export.
  disabled: boolean;
  onExportCsv: () => void;
  onExportXlsx: () => void;
};

// Visible columns in the order the table currently shows them, mapped to their
// export definitions — hidden columns and ones without an export mapping (e.g.
// select/actions) drop out.
const visibleExportColumns = <TRow>(
  table: Table<TRow>,
  columns: ExportColumn<TRow>[],
): ExportColumn<TRow>[] =>
  table
    .getVisibleLeafColumns()
    .map((column) => columns.find((entry) => entry.id === column.id))
    .filter((entry): entry is ExportColumn<TRow> => Boolean(entry));

// Drives the data-table export: fetches the unpaginated rows for the current
// query, generates the file client-side from the visible columns, and saves it.
// Returns undefined when no export is configured so the toolbar can hide it.
export const useDataTableExport = <TRow>(
  table: Table<TRow>,
  config?: DataTableExportConfig<TRow>,
): DataTableExportControls | undefined => {
  const [isExporting, setIsExporting] = useState(false);

  const run = useCallback(
    async (format: ExportFormat) => {
      if (!config) return;
      setIsExporting(true);
      try {
        const columns = visibleExportColumns(table, config.columns);

        const response = await fetch(`${config.route}?${config.apiParams}`);
        if (!response.ok) throw new Error("Export request failed");
        const { items, truncated } =
          (await response.json()) as ExportResult<TRow>;

        if (format === ExportFormat.Csv) {
          const blob = new Blob([toCsv(items, columns)], { type: CSV_MIME });
          saveAs(blob, `${config.fileName}.csv`);
        } else {
          saveAs(
            await toXlsx(items, columns, config.fileName),
            `${config.fileName}.xlsx`,
          );
        }

        if (truncated) {
          toast.warning(
            `Export limited to ${EXPORT_ROW_LIMIT.toLocaleString()} rows. Refine your filters for complete data.`,
          );
        }
      } catch {
        toast.error("Export failed. Please try again.");
      } finally {
        setIsExporting(false);
      }
    },
    [config, table],
  );

  if (!config) return undefined;

  return {
    isExporting,
    disabled: visibleExportColumns(table, config.columns).length === 0,
    onExportCsv: () => void run(ExportFormat.Csv),
    onExportXlsx: () => void run(ExportFormat.Xlsx),
  };
};
