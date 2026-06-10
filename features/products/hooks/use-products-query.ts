import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchProducts } from "@/features/products/services/product-client";
import { QUERY_KEYS } from "@/lib/query-keys";

// Fetches a page of products for the given API query string. React Query owns
// caching and request cancellation (via the passed signal), so no manual
// AbortController is needed. keepPreviousData avoids a flash of empty table
// while paginating/filtering.
export const useProductsQuery = (apiParams: string) =>
  useQuery({
    queryKey: QUERY_KEYS.products(apiParams),
    queryFn: ({ signal }) => fetchProducts(apiParams, signal),
    placeholderData: keepPreviousData,
  });
