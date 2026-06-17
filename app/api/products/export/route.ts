import { type NextRequest, NextResponse } from "next/server";

import {
  listProductsForExport,
  SORTABLE_COLUMNS,
} from "@/features/products/services/product-service";
import { parseSearch } from "@/lib/api/search-params";
import { parseSort } from "@/lib/api/sort-params";
import { withApi } from "@/lib/api/with-api";

// Returns every records (no pagination, capped) as JSON;
export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const q = parseSearch(params);
  const sort = parseSort(params, SORTABLE_COLUMNS);

  const result = await listProductsForExport({
    userId: session.user.id,
    q,
    sort,
  });

  return NextResponse.json(result);
});
