import { type NextRequest, NextResponse } from "next/server";

import {
  listPublications,
  publishProductToAccounts,
  SORTABLE_COLUMNS,
} from "@/features/publications/services/publication-service";
import { parseBody } from "@/lib/api/body";
import { NotFoundError } from "@/lib/api/errors";
import { parseStatusFilter } from "@/lib/api/filter-params";
import { parsePagination } from "@/lib/api/pagination-params";
import { parseSearch } from "@/lib/api/search-params";
import { parseSort } from "@/lib/api/sort-params";
import { withApi } from "@/lib/api/with-api";
import { PublicationStatus } from "@/lib/enums/publication";
import { publishRequestSchema } from "@/validations/publication";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const { page, limit } = parsePagination(params);
  const q = parseSearch(params);
  const statuses = parseStatusFilter(params, PublicationStatus);
  const accountId = params.get("accountId") ?? undefined;
  const sort = parseSort(params, SORTABLE_COLUMNS);

  const result = await listPublications({
    userId: session.user.id,
    page,
    limit,
    q,
    statuses,
    accountId,
    sort,
  });

  return NextResponse.json(result);
});

export const POST = withApi(async (request: NextRequest, _context, session) => {
  const { productId, accounts } = await parseBody(
    request,
    publishRequestSchema,
    "Invalid publish request",
  );

  const outcome = await publishProductToAccounts({
    userId: session.user.id,
    productId,
    accounts,
  });

  if (!outcome.productFound) {
    throw new NotFoundError("Product not found");
  }

  return NextResponse.json({ results: outcome.results }, { status: 201 });
});
