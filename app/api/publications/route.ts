import { type NextRequest, NextResponse } from "next/server";

import {
  isPublicationSortField,
  listPublications,
  publishProductToAccounts,
} from "@/features/publications/services/publication-service";
import { auth } from "@/lib/auth/server";
import { PublicationStatus } from "@/lib/enums/publication";
import { publishRequestSchema } from "@/validations/publication";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatuses = (values: string[]): PublicationStatus[] => {
  const allowed = Object.values(PublicationStatus);
  return values.filter((value): value is PublicationStatus =>
    allowed.includes(value as PublicationStatus),
  );
};

export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = parsePositiveInt(params.get("page"), 1);
  const limit = Math.min(parsePositiveInt(params.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const q = params.get("q") ?? undefined;
  const statuses = parseStatuses(params.getAll("status"));

  const sortField = params.get("sort");
  const sort =
    sortField && isPublicationSortField(sortField)
      ? { id: sortField, desc: params.get("dir") !== "asc" }
      : undefined;

  const result = await listPublications({
    userId: session.user.id,
    page,
    limit,
    q,
    statuses,
    sort,
  });

  return NextResponse.json(result);
};

export const POST = async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish request" }, { status: 400 });
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
