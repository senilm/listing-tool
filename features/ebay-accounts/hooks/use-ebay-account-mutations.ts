import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import {
  disconnectEbayAccountRequest,
  renameEbayAccountRequest,
} from "@/features/ebay-accounts/services/ebay-account-client";

const useInvalidateEbayAccounts = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ebayAccountsRoot });
};

export const useRenameEbayAccount = () => {
  const invalidate = useInvalidateEbayAccounts();
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) =>
      renameEbayAccountRequest(id, label),
    onSuccess: invalidate,
  });
};

export const useDisconnectEbayAccount = () => {
  const invalidate = useInvalidateEbayAccounts();
  return useMutation({
    mutationFn: (id: string) => disconnectEbayAccountRequest(id),
    onSuccess: invalidate,
  });
};
