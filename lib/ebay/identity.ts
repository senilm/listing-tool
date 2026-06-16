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
// rely on it). Best-effort: returns null on any failure, in which case the
// caller links without a dedup key.
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
    if (!res.ok) return null;
    const data = (await res.json()) as EbayUserResponse;
    if (!data.userId) return null;
    return { userId: data.userId, username: data.username ?? null };
  } catch {
    return null;
  }
};
