// Builds a type guard for a service's SORTABLE_COLUMNS map, narrowing a raw
// query-param value to that service's sort-field union.
export const createSortFieldGuard =
  <F extends string>(columns: Record<F, unknown>) =>
  (value: string): value is F =>
    value in columns;
