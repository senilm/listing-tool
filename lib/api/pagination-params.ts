const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Parses ?page&limit. Non-positive-integer values fall back to the defaults,
// and limit is clamped to MAX_LIMIT so a caller can't request the whole table.
export const parsePagination = (params: URLSearchParams) => {
  const page = parsePositiveInt(params.get("page"), 1);
  const limit = Math.min(
    parsePositiveInt(params.get("limit"), DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  return { page, limit };
};
