import { neutralizeCsvCell } from "@/lib/export/csv-formula-guard";
import { type ExportCell, type ExportColumn } from "@/lib/export/types";

// RFC-4180 cell escaping over the formula-guarded text: wrap in quotes when the
// value contains a comma, quote, or newline, doubling any embedded quotes.
const formatCell = (cell: ExportCell): string => {
  if (cell === null) return "";
  const text = neutralizeCsvCell(String(cell));
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toLine = <TRow>(row: TRow, columns: ExportColumn<TRow>[]): string =>
  columns.map((column) => formatCell(column.value(row))).join(",");

// Serialises rows to a CSV string. A leading BOM makes Excel open it as UTF-8
// rather than mangling non-ASCII characters.
export const toCsv = <TRow>(
  rows: TRow[],
  columns: ExportColumn<TRow>[],
): string => {
  const header = columns.map((column) => formatCell(column.header)).join(",");
  const body = rows.map((row) => toLine(row, columns));
  return `﻿${[header, ...body].join("\r\n")}`;
};
