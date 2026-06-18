import { NextResponse } from "next/server";

import { getDashboardStats } from "@/features/dashboard/services/dashboard-service";
import { withApi } from "@/lib/api/with-api";

export const GET = withApi(async (_request, _context, session) => {
  const stats = await getDashboardStats({ userId: session.user.id });
  return NextResponse.json(stats);
});
