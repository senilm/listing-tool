import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import {
  isEbayAccountSortField,
  listEbayAccounts,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatuses = (values: string[]): EbayAccountStatus[] => {
  const allowed = Object.values(EbayAccountStatus);
  return values.filter((value): value is EbayAccountStatus =>
    allowed.includes(value as EbayAccountStatus),
  );
};

export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = parsePositiveInt(params.get("page"), 1);
  const limit = Math.min(
    parsePositiveInt(params.get("limit"), DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const q = params.get("q") ?? undefined;
  const statuses = parseStatuses(params.getAll("status"));

  const sortField = params.get("sort");
  const sort =
    sortField && isEbayAccountSortField(sortField)
      ? { id: sortField, desc: params.get("dir") !== "asc" }
      : undefined;

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
