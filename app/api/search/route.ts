import { type NextRequest, NextResponse } from "next/server";

import { globalSearch } from "@/features/search/services/search-service";
import { auth } from "@/lib/auth/server";

export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ products: [], accounts: [], publications: [] });
  }

  const result = await globalSearch({ userId: session.user.id, q });
  return NextResponse.json(result);
};
