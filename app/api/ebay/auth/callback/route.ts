import { type NextRequest } from "next/server";

import { exchangeCodeForTokens } from "@/lib/ebay/oauth";

// eBay redirects here with ?code=... after consent. You can also hit this
// manually (paste the code) if your RuName accept URL points elsewhere.
export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return Response.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    return Response.json({
      message: "Copy refresh_token into EBAY_REFRESH_TOKEN in .env.local, then restart dev.",
      refresh_token: tokens.refresh_token,
      refresh_token_expires_in: tokens.refresh_token_expires_in,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Token exchange failed" },
      { status: 500 },
    );
  }
};
