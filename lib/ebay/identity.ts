import { ebayIdentityUserRoute } from "@/lib/ebay/api-routes";
import { ebayConfig } from "@/lib/ebay/config";

type EbayUserResponse = {
  userId?: string;
  username?: string;
};

export type EbayIdentity = {
  userId: string;
  username: string | null;
};

// Reads the seller's identity via the Commerce Identity API using the freshly
// minted access token. Note this API lives on the apiz host, not api.
//
// `userId` is eBay's immutable, per-account identifier — our dedup key (the
// username is user-editable and being withdrawn for US accounts, so we don't
// rely on it). Best-effort: returns null on any failure (e.g. the sandbox
// getUser outage), in which case the caller links without a dedup key.
export const fetchEbayIdentity = async (
  accessToken: string,
): Promise<EbayIdentity | null> => {
  try {
    const res = await fetch(
      `${ebayConfig.identityBase}${ebayIdentityUserRoute()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );
    // TODO: temporary diagnostics for the sandbox getUser test — remove once confirmed.
    console.warn("Fetching eBay identity:", res.status, res.statusText);
    if (!res.ok) {
      console.error(
        "Failed to fetch eBay identity:",
        res.status,
        res.statusText,
      );
      return null;
    }
    const data = (await res.json()) as EbayUserResponse;
    console.warn("Fetched eBay identity:", data);
    if (!data.userId) return null;
    return { userId: data.userId, username: data.username ?? null };
  } catch (error) {
    console.error("Error fetching eBay identity:", error);
    return null;
  }
};
