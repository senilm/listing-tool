import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTestPoliciesRequest } from "@/features/ebay-accounts/services/ebay-account-client";
import { QUERY_KEYS } from "@/lib/query-keys";

// Seeds default sandbox policies on an account, then primes the listing-options
// cache with the refreshed lists so the dropdowns populate without a refetch.
export const useCreateTestPolicies = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createTestPoliciesRequest(accountId),
    onSuccess: (options) =>
      queryClient.setQueryData(
        QUERY_KEYS.ebayAccountListingOptions(accountId),
        options,
      ),
  });
};
