import { type ListEbayAccountsResult } from "@/features/ebay-accounts/services/ebay-account-service";
import { ebayAccountApiRoute, ebayAccountsApiRoute } from "@/lib/api-routes";

// Client-side HTTP calls to the eBay-account API. The server service
// (ebay-account-service.ts) is the only DB-touching code; the type import here
// is erased at build, so no server code leaks into the client bundle.

export const fetchEbayAccounts = async (
  params: string,
  signal?: AbortSignal,
): Promise<ListEbayAccountsResult> => {
  const res = await fetch(`${ebayAccountsApiRoute()}?${params}`, { signal });
  if (!res.ok) throw new Error("Failed to load eBay accounts");
  return res.json() as Promise<ListEbayAccountsResult>;
};

export const renameEbayAccountRequest = async (
  id: string,
  label: string,
): Promise<void> => {
  const res = await fetch(ebayAccountApiRoute(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) throw new Error("Failed to rename eBay account");
};

export const disconnectEbayAccountRequest = async (
  id: string,
): Promise<void> => {
  const res = await fetch(ebayAccountApiRoute(id), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to disconnect eBay account");
};
