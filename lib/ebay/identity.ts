import { ebayConfig } from "@/lib/ebay/config";

type EbayUserResponse = {
  username?: string;
};

// Best-effort: reads the seller's eBay username via the Identity API using the
// freshly minted access token. Returns null on any failure — the sandbox is
// flaky and this only seeds a default label the user can rename.
export const fetchEbayUsername = async (
  accessToken: string,
): Promise<string | null> => {
  try {
    const res = await fetch(`${ebayConfig.apiBase}/commerce/identity/v1/user/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as EbayUserResponse;
    return data.username ?? null;
  } catch {
    return null;
  }
};
