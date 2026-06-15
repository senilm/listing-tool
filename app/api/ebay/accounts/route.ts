import { type NextRequest, NextResponse } from "next/server";

import {
  listEbayAccounts,
  SORTABLE_COLUMNS,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { parseStatusFilter } from "@/lib/api/filter-params";
import { parsePagination } from "@/lib/api/pagination-params";
import { parseSearch } from "@/lib/api/search-params";
import { parseSort } from "@/lib/api/sort-params";
import { withApi } from "@/lib/api/with-api";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const { page, limit } = parsePagination(params);
  const q = parseSearch(params);
  const statuses = parseStatusFilter(params, EbayAccountStatus);
  const sort = parseSort(params, SORTABLE_COLUMNS);

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
