// Date-only helpers (no time component). ISO date strings are "yyyy-MM-dd".
// Parsing forces local midnight so a date never shifts across timezones.

export const toSafeDate = (date: string | Date): Date => {
  if (typeof date === "string") {
    return new Date(date.split("T")[0] + "T00:00:00");
  }
  return date;
};

export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateFromISO = (isoDateStr: string): Date =>
  new Date(isoDateStr + "T00:00:00");

export const toDateInputValue = (isoString?: string | null): string =>
  isoString?.split("T")[0] ?? "";

const currentYear = new Date().getFullYear();
export const CALENDAR_START = new Date(currentYear - 100, 0);
export const CALENDAR_END = new Date(currentYear + 100, 11);
