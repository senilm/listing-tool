import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { publishProductRequest } from "@/features/publications/services/publication-client";
import { type PublishRequest } from "@/validations/publication";

// Publishing creates publication rows, so invalidate the publications prefix on
// success and every cached list refetches.
export const usePublishProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishRequest) => publishProductRequest(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicationsRoot }),
  });
};
