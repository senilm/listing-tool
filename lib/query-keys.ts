// Central registry of React Query keys, so list queries and the mutations that
// invalidate them always agree on the same prefix.
export const QUERY_KEYS = {
  // Prefix for all product queries — invalidate this to refetch every list.
  productsRoot: ["products"] as const,
  products: (params: string) => ["products", "list", params] as const,
};
