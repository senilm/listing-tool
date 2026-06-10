import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchPublications } from "@/features/publications/services/publication-client";
import { QUERY_KEYS } from "@/lib/query-keys";

export const usePublicationsQuery = (apiParams: string) =>
  useQuery({
    queryKey: QUERY_KEYS.publications(apiParams),
    queryFn: ({ signal }) => fetchPublications(apiParams, signal),
    placeholderData: keepPreviousData,
  });
