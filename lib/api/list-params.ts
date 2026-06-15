const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const MAX_QUERY_LENGTH = 100;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseEnumValues = <T extends string>(
  values: string[],
  enumObj: Record<string, T>,
): T[] => {
  const allowed = Object.values(enumObj);
  return values.filter((value): value is T => allowed.includes(value as T));
};

type ListParamsOptions<S extends string, F extends string> = {
  statusEnum?: Record<string, S>;
  isSortField: (value: string) => value is F;
};

// Parses the shared list-endpoint query params (?page&limit&q&status&sort&dir).
// Status values outside the enum and unknown sort fields are dropped.
export const parseListParams = <
  S extends string = string,
  F extends string = string,
>(
  params: URLSearchParams,
  { statusEnum, isSortField }: ListParamsOptions<S, F>,
) => {
  const page = parsePositiveInt(params.get("page"), 1);
  const limit = Math.min(
    parsePositiveInt(params.get("limit"), DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const q = params.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);
  const statuses = statusEnum
    ? parseEnumValues(params.getAll("status"), statusEnum)
    : [];

  const sortField = params.get("sort");
  const sort =
    sortField && isSortField(sortField)
      ? { id: sortField, desc: params.get("dir") !== "asc" }
      : undefined;

  return { page, limit, q, statuses, sort };
};
