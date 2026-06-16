import { ebayConfig } from "@/lib/ebay/config";

export const EBAY_MARKETPLACE_ID = "EBAY_US";

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
};

// Authenticated JSON request against the eBay Sell/Commerce REST APIs. Unlike
// the old single-tenant POC, the access token is passed in explicitly — it's
// minted per account from that account's stored refresh token, so there is no
// global token cache.
export const ebayRequest = async <T = unknown>(
  accessToken: string,
  path: string,
  options: RequestOptions = {},
): Promise<{ status: number; data: T }> => {
  const url = new URL(`${ebayConfig.apiBase}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Language": "en-US",
      "Accept-Language": "en-US",
      Accept: "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  };

  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `eBay ${init.method} ${path} failed: ${res.status} ${text}`,
    );
  }
  return { status: res.status, data: (text ? JSON.parse(text) : {}) as T };
};
