import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchEbayAccounts } from "@/features/ebay-accounts/services/ebay-account-client";

export const useEbayAccountsQuery = (apiParams: string) =>
  useQuery({
    queryKey: QUERY_KEYS.ebayAccounts(apiParams),
    queryFn: ({ signal }) => fetchEbayAccounts(apiParams, signal),
    placeholderData: keepPreviousData,
  });
