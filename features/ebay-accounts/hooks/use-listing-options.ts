import { useQuery } from "@tanstack/react-query";

import { fetchListingOptions } from "@/features/ebay-accounts/services/ebay-account-client";
import { QUERY_KEYS } from "@/lib/query-keys";

// Fetched lazily — pass `enabled` so a tab only loads when it becomes active.
export const useListingOptions = (accountId: string, enabled: boolean) =>
  useQuery({
    queryKey: QUERY_KEYS.ebayAccountListingOptions(accountId),
    queryFn: ({ signal }) => fetchListingOptions(accountId, signal),
    enabled,
  });
