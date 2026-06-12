import { type NextRequest, NextResponse } from "next/server";

import { globalSearch } from "@/features/search/services/search-service";
import { requireSession } from "@/lib/api/auth";

export const GET = async (request: NextRequest) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ products: [], accounts: [], publications: [] });
  }

  const result = await globalSearch({ userId: session.user.id, q });
  return NextResponse.json(result);
};
