import { randomBytes } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { EBAY_OAUTH_STATE_COOKIE } from "@/lib/constants";
import { buildConsentUrl } from "@/lib/ebay/oauth";
import { loginRoute } from "@/lib/routes";

// Starts the eBay consent flow for the signed-in user: mints a CSRF state,
// stores it in an httpOnly cookie, and redirects to eBay's consent screen.
export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL(loginRoute(), request.url));
  }

  const state = randomBytes(32).toString("hex");
  const response = NextResponse.redirect(buildConsentUrl(state));
  response.cookies.set(EBAY_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
};
