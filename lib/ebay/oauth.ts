import {
  ebayConfig,
  EBAY_CONSENT_SCOPES,
  EBAY_SCOPES,
} from "@/lib/ebay/config";

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
    throw new Error(
      `eBay token request failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json();
};

// Step 1 of the auth-code grant: where to send the seller to consent.
export const buildConsentUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: ebayConfig.clientId,
    redirect_uri: ebayConfig.ruName,
    response_type: "code",
    scope: EBAY_CONSENT_SCOPES.join(" "),
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

// Mint a fresh short-lived access token from a stored (per-account) refresh token.
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<TokenResponse> =>
  postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: EBAY_SCOPES.join(" "),
    }),
  );
