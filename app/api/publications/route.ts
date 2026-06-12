import { type NextRequest, NextResponse } from "next/server";

import {
  isPublicationSortField,
  listPublications,
  publishProductToAccounts,
} from "@/features/publications/services/publication-service";
import { requireSession } from "@/lib/api/auth";
import { parseListParams } from "@/lib/api/list-params";
import { PublicationStatus } from "@/lib/enums/publication";
import { publishRequestSchema } from "@/validations/publication";

export const GET = async (request: NextRequest) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

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
};

export const POST = async (request: NextRequest) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid publish request" },
      { status: 400 },
    );
  }

  const outcome = await publishProductToAccounts({
    userId: session.user.id,
    productId: parsed.data.productId,
    accountIds: parsed.data.accountIds,
  });

  if (!outcome.productFound) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ results: outcome.results }, { status: 201 });
};
