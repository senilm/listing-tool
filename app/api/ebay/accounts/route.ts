import { type NextRequest, NextResponse } from "next/server";

import {
  isEbayAccountSortField,
  listEbayAccounts,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { parseListParams } from "@/lib/api/list-params";
import { withApi } from "@/lib/api/with-api";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const { page, limit, q, statuses, sort } = parseListParams(
    request.nextUrl.searchParams,
    { statusEnum: EbayAccountStatus, isSortField: isEbayAccountSortField },
  );

  const result = await listEbayAccounts({
    userId: session.user.id,
    page,
    limit,
    q,
    statuses,
    sort,
  });

  return NextResponse.json(result);
});
