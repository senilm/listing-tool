// Builds a type guard for a service's SORTABLE_COLUMNS map, narrowing a raw
// query-param value to that service's sort-field union.
export const createSortFieldGuard =
  <F extends string>(columns: Record<F, unknown>) =>
  (value: string): value is F =>
    value in columns;

// Parses ?sort&dir into a sort spec. Unknown sort fields (rejected by the
// guard) yield undefined so the service falls back to its default order; dir is
// descending unless explicitly "asc".
export const parseSort = <F extends string>(
  params: URLSearchParams,
  isSortField: (value: string) => value is F,
): { id: F; desc: boolean } | undefined => {
  const sortField = params.get("sort");
  if (!sortField || !isSortField(sortField)) return undefined;
  return { id: sortField, desc: params.get("dir") !== "asc" };
};
