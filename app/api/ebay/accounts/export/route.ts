import { type NextRequest, NextResponse } from "next/server";

import {
  listEbayAccountsForExport,
  SORTABLE_COLUMNS,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { parseStatusFilter } from "@/lib/api/filter-params";
import { parseSearch } from "@/lib/api/search-params";
import { parseSort } from "@/lib/api/sort-params";
import { withApi } from "@/lib/api/with-api";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

// Returns every records (no pagination, capped) as JSON;
export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const q = parseSearch(params);
  const statuses = parseStatusFilter(params, EbayAccountStatus);
  const sort = parseSort(params, SORTABLE_COLUMNS);

  const result = await listEbayAccountsForExport({
    userId: session.user.id,
    q,
    statuses,
    sort,
  });

  return NextResponse.json(result);
});
