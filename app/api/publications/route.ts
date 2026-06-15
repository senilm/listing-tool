import { type NextRequest, NextResponse } from "next/server";

import {
  isPublicationSortField,
  listPublications,
  publishProductToAccounts,
} from "@/features/publications/services/publication-service";
import { parseBody } from "@/lib/api/body";
import { NotFoundError } from "@/lib/api/errors";
import { parseListParams } from "@/lib/api/list-params";
import { withApi } from "@/lib/api/with-api";
import { PublicationStatus } from "@/lib/enums/publication";
import { publishRequestSchema } from "@/validations/publication";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const params = request.nextUrl.searchParams;
  const { page, limit, q, statuses, sort } = parseListParams(params, {
    statusEnum: PublicationStatus,
    isSortField: isPublicationSortField,
  });
  const accountId = params.get("accountId") ?? undefined;

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
  const { productId, accountIds } = await parseBody(
    request,
    publishRequestSchema,
    "Invalid publish request",
  );

  const outcome = await publishProductToAccounts({
    userId: session.user.id,
    productId,
    accountIds,
  });

  if (!outcome.productFound) {
    throw new NotFoundError("Product not found");
  }

  return NextResponse.json({ results: outcome.results }, { status: 201 });
});
