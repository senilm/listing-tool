import { ebayConfig, EBAY_SCOPES } from "@/lib/ebay/config";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  token_type: string;
};

const tokenEndpoint = () => `${ebayConfig.apiBase}/identity/v1/oauth2/token`;

const basicAuthHeader = () => {
  const creds = `${ebayConfig.clientId}:${ebayConfig.clientSecret}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
};

const postToken = async (body: URLSearchParams): Promise<TokenResponse> => {
  const res = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`eBay token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
};

// Step 1 of the auth-code grant: where to send the seller to consent.
export const buildConsentUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: ebayConfig.clientId,
    redirect_uri: ebayConfig.ruName,
    response_type: "code",
    scope: EBAY_SCOPES.join(" "),
    state,
    prompt: "login",
  });
  return `${ebayConfig.authBase}/oauth2/authorize?${params.toString()}`;
};

// Step 3: trade the authorization code for access + refresh tokens.
export const exchangeCodeForTokens = (code: string) =>
  postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: ebayConfig.ruName,
    }),
  );

// Mint a fresh short-lived access token from a stored refresh token.
export const refreshAccessToken = async (
  refreshToken = ebayConfig.refreshToken,
): Promise<TokenResponse> =>
  postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: EBAY_SCOPES.join(" "),
    }),
  );

let cachedToken: { value: string; expiresAt: number } | null = null;

// Returns a valid access token, refreshing (and caching) only when needed.
export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const data = await refreshAccessToken();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
};
