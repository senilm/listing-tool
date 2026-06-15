export const MAX_QUERY_LENGTH = 100;

// Parses the free-text search query (?q): trimmed and length-clamped. Undefined
// when absent or blank-after-trim.
export const parseSearch = (params: URLSearchParams): string | undefined =>
  params.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);
