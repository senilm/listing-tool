// Central registry of React Query keys, so list queries and the mutations that
// invalidate them always agree on the same prefix.
export const QUERY_KEYS = {
  // Prefix for all product queries — invalidate this to refetch every list.
  productsRoot: ["products"] as const,
  products: (params: string) => ["products", "list", params] as const,

  // Prefix for all eBay-account queries.
  ebayAccountsRoot: ["ebay-accounts"] as const,
  ebayAccounts: (params: string) => ["ebay-accounts", "list", params] as const,

  // Prefix for all publication queries.
  publicationsRoot: ["publications"] as const,
  publications: (params: string) => ["publications", "list", params] as const,
};
