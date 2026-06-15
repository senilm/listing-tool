// Parses ?sort&dir into a sort spec. The sort field must be a key of the
// caller's sortable-columns map — anything else yields undefined so the service
// falls back to its default order. dir is descending unless explicitly "asc".
export const parseSort = <F extends string>(
  params: URLSearchParams,
  sortableColumns: Record<F, unknown>,
): { id: F; desc: boolean } | undefined => {
  const sortField = params.get("sort");
  if (!sortField || !(sortField in sortableColumns)) return undefined;
  return { id: sortField as F, desc: params.get("dir") !== "asc" };
};
