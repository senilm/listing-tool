import { ebayConfig } from "@/lib/ebay/config";
import { getAccessToken } from "@/lib/ebay/oauth";

export const EBAY_MARKETPLACE_ID = "EBAY_US";

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
};

// Authenticated JSON request against the eBay Sell/Commerce REST APIs.
export const ebayRequest = async <T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<{ status: number; data: T }> => {
  const token = await getAccessToken();
  const url = new URL(`${ebayConfig.apiBase}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Language": "en-US",
      "Accept-Language": "en-US",
      Accept: "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  };

  // eBay's sandbox intermittently returns 5xx "System error" (errorId 25001);
  // retry a few times with backoff before giving up.
  const maxAttempts = 4;
  let lastText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await fetch(url, init);
    const text = await res.text();
    if (res.ok) {
      return { status: res.status, data: (text ? JSON.parse(text) : {}) as T };
    }
    lastText = text;
    if (res.status < 500 || attempt === maxAttempts) {
      throw new Error(`eBay ${init.method} ${path} failed: ${res.status} ${text}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw new Error(`eBay ${init.method} ${path} failed: ${lastText}`);
};
