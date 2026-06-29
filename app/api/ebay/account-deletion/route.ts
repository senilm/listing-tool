import { createHash } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { ebayConfig } from "@/lib/ebay/config";

// eBay Marketplace Account Deletion/Closure notification endpoint.
//
// GET  — validation handshake. eBay sends ?challenge_code=... and expects back
//        { challengeResponse: sha256(challengeCode + verificationToken + endpointUrl) }.
//        Passing this is what re-enables a disabled production keyset.
// POST — the actual deletion notification. We acknowledge with 200 so eBay stops
//        retrying. Wiring up the real per-user data purge is a TODO (see below).

export const GET = async (request: NextRequest) => {
  const challengeCode = request.nextUrl.searchParams.get("challenge_code");
  const { deletionVerificationToken, deletionEndpointUrl } = ebayConfig;

  if (!challengeCode) {
    return NextResponse.json(
      { error: "Missing challenge_code" },
      { status: 400 },
    );
  }

  if (!deletionVerificationToken || !deletionEndpointUrl) {
    return NextResponse.json(
      { error: "Deletion endpoint not configured" },
      { status: 500 },
    );
  }

  // Order matters: challengeCode, then token, then the exact registered URL.
  const challengeResponse = createHash("sha256")
    .update(challengeCode)
    .update(deletionVerificationToken)
    .update(deletionEndpointUrl)
    .digest("hex");

  return NextResponse.json({ challengeResponse });
};

export const POST = async (request: NextRequest) => {
  // Acknowledge fast so eBay doesn't retry. eBay treats any 2xx as success.
  await request.json().catch(() => null);

  // TODO: purge the eBay user's stored data (ebay-account rows, tokens, blobs)
  // using the userId in the notification payload.

  return new NextResponse(null, { status: 200 });
};
