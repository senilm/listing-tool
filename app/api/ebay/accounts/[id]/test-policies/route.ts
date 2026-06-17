import { type NextRequest, NextResponse } from "next/server";

import { createAccountTestPolicies } from "@/features/ebay-accounts/services/ebay-account-service";
import { BadRequestError } from "@/lib/api/errors";
import { withApi } from "@/lib/api/with-api";
import { ebayConfig } from "@/lib/ebay/config";

type RouteContext = { params: Promise<{ id: string }> };

// Sandbox-only: seeds default business policies + a location on the account so
// the publish flow can be exercised end-to-end. Refuses outright in production
// — real sellers configure their own policies on eBay.
export const POST = withApi(
  async (_request: NextRequest, { params }: RouteContext, session) => {
    if (ebayConfig.env !== "sandbox") {
      throw new BadRequestError(
        "Test policies can only be created in the sandbox environment",
      );
    }
    const { id } = await params;
    const options = await createAccountTestPolicies({
      id,
      userId: session.user.id,
    });
    return NextResponse.json(options);
  },
);
