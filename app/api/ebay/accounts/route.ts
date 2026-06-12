import { type NextRequest, NextResponse } from "next/server";

import {
  isEbayAccountSortField,
  listEbayAccounts,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { requireSession } from "@/lib/api/auth";
import { parseListParams } from "@/lib/api/list-params";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

export const GET = async (request: NextRequest) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

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
};
