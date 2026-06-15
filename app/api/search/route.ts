import { type NextRequest, NextResponse } from "next/server";

import { globalSearch } from "@/features/search/services/search-service";
import { MAX_QUERY_LENGTH } from "@/lib/api/list-params";
import { withApi } from "@/lib/api/with-api";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const q =
    request.nextUrl.searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) ??
    "";
  if (!q) {
    return NextResponse.json({ products: [], accounts: [], publications: [] });
  }

  const result = await globalSearch({ userId: session.user.id, q });
  return NextResponse.json(result);
});
