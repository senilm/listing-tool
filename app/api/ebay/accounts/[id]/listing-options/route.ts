import { type NextRequest, NextResponse } from "next/server";

import { getAccountListingOptions } from "@/features/ebay-accounts/services/ebay-account-service";
import { withApi } from "@/lib/api/with-api";

type RouteContext = { params: Promise<{ id: string }> };

// Lists the account's eBay business policies + inventory locations.
export const GET = withApi(
  async (_request: NextRequest, { params }: RouteContext, session) => {
    const { id } = await params;
    const options = await getAccountListingOptions({
      id,
      userId: session.user.id,
    });
    return NextResponse.json(options);
  },
);
