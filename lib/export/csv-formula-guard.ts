const FORMULA_TRIGGERS = new Set(["=", "+", "-", "@", "\t", "\r"]);

// Prefixes cells that a spreadsheet could parse as a formula with a single
// quote, neutralising CSV/formula injection (OWASP). Applied to CSV only —
// XLSX cells written via exceljs are stored as string values, not formulas.
export const neutralizeCsvCell = (value: string): string =>
  value.length > 0 && FORMULA_TRIGGERS.has(value[0]) ? `'${value}` : value;
