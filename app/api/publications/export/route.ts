import { type NextRequest, NextResponse } from "next/server";

import {
  listPublicationsForExport,
  SORTABLE_COLUMNS,
} from "@/features/publications/services/publication-service";
import { parseStatusFilter } from "@/lib/api/filter-params";
import { parseSearch } from "@/lib/api/search-params";
import { parseSort } from "@/lib/api/sort-params";
import { withApi } from "@/lib/api/with-api";
import { PublicationStatus } from "@/lib/enums/publication";

// Returns every records (no pagination, capped) as JSON;
export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const q = parseSearch(params);
  const statuses = parseStatusFilter(params, PublicationStatus);
  const accountId = params.get("accountId") ?? undefined;
  const sort = parseSort(params, SORTABLE_COLUMNS);

  const result = await listPublicationsForExport({
    userId: session.user.id,
    q,
    statuses,
    accountId,
    sort,
  });

  return NextResponse.json(result);
});
