import { publicationsApiRoute } from "@/lib/api-routes";
import {
  type ListPublicationsResult,
  type PublishResult,
} from "@/features/publications/services/publication-service";
import { type PublishRequest } from "@/validations/publication";

// Client-side HTTP calls to the publications API. The server service
// (publication-service.ts) is the only DB/eBay-touching code; the type imports
// here are erased at build, so no server code leaks into the client bundle.

export const fetchPublications = async (
  params: string,
  signal?: AbortSignal,
): Promise<ListPublicationsResult> => {
  const res = await fetch(`${publicationsApiRoute()}?${params}`, { signal });
  if (!res.ok) throw new Error("Failed to load publications");
  return res.json() as Promise<ListPublicationsResult>;
};

export const publishProductRequest = async (
  input: PublishRequest,
): Promise<{ results: PublishResult[] }> => {
  const res = await fetch(publicationsApiRoute(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to publish product");
  return res.json() as Promise<{ results: PublishResult[] }>;
};
