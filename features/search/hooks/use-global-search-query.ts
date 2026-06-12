import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchGlobalSearch } from "@/features/search/services/search-client";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useGlobalSearchQuery = (q: string) => {
  const trimmed = q.trim();

  return useQuery({
    queryKey: QUERY_KEYS.search(trimmed),
    queryFn: ({ signal }) => fetchGlobalSearch(trimmed, signal),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
};
