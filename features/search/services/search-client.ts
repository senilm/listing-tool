import { type GlobalSearchResult } from "@/features/search/services/search-service";
import { searchApiRoute } from "@/lib/api-routes";

export const fetchGlobalSearch = async (
  q: string,
  signal?: AbortSignal,
): Promise<GlobalSearchResult> => {
  const params = new URLSearchParams({ q });
  const res = await fetch(`${searchApiRoute()}?${params.toString()}`, {
    signal,
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json() as Promise<GlobalSearchResult>;
};
