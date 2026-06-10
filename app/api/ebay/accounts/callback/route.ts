import { type NextRequest, NextResponse } from "next/server";

import { linkEbayAccount } from "@/features/ebay-accounts/services/ebay-account-service";
import { auth } from "@/lib/auth/server";
import { EBAY_OAUTH_STATE_COOKIE } from "@/lib/constants";
import { EBAY_CONSENT_SCOPES } from "@/lib/ebay/config";
import { fetchEbayUsername } from "@/lib/ebay/identity";
import { exchangeCodeForTokens } from "@/lib/ebay/oauth";
import { ebayAccountsRoute, loginRoute } from "@/lib/routes";

const backTo = (request: NextRequest, params: Record<string, string>) => {
  const url = new URL(ebayAccountsRoute(), request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
};

const withClearedState = (response: NextResponse) => {
  response.cookies.delete(EBAY_OAUTH_STATE_COOKIE);
  return response;
};

// eBay redirects the seller here after consent (the RuName accept URL must
// point at this path). Verifies the CSRF state, exchanges the code, and stores
// the encrypted refresh token against the signed-in user.
export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL(loginRoute(), request.url));
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(EBAY_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return withClearedState(
      NextResponse.redirect(backTo(request, { error: "consent_failed" })),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return withClearedState(
        NextResponse.redirect(backTo(request, { error: "no_refresh_token" })),
      );
    }

    const ebayUsername = await fetchEbayUsername(tokens.access_token);

    await linkEbayAccount({
      userId: session.user.id,
      ebayUsername,
      refreshToken: tokens.refresh_token,
      refreshTokenExpiresAt: tokens.refresh_token_expires_in
        ? new Date(Date.now() + tokens.refresh_token_expires_in * 1000)
        : null,
      scopes: EBAY_CONSENT_SCOPES,
    });

    return withClearedState(
      NextResponse.redirect(backTo(request, { connected: "1" })),
    );
  } catch {
    return withClearedState(
      NextResponse.redirect(backTo(request, { error: "link_failed" })),
    );
  }
};
