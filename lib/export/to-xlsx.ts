import { type ExportColumn } from "@/lib/export/types";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// exceljs is heavy, so it's loaded on demand the first time someone exports an
// XLSX rather than shipped in the main bundle.
export const toXlsx = async <TRow>(
  rows: TRow[],
  columns: ExportColumn<TRow>[],
  sheetName: string,
): Promise<Blob> => {
  const { Workbook } = await import("exceljs");

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31) || "Sheet1");

  sheet.columns = columns.map((column) => ({
    header: column.header,
    width: 24,
  }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(columns.map((column) => column.value(row) ?? ""));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: XLSX_MIME });
};
