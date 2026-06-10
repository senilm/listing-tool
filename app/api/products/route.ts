import { type NextRequest, NextResponse } from "next/server";

import {
  createProduct,
  isProductSortField,
  listProducts,
} from "@/features/products/services/product-service";
import { auth } from "@/lib/auth/server";
import { ProductStatus } from "@/lib/enums/product";
import { productInputSchema } from "@/validations/product";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatuses = (values: string[]): ProductStatus[] => {
  const allowed = Object.values(ProductStatus);
  return values.filter((value): value is ProductStatus =>
    allowed.includes(value as ProductStatus),
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
    sortField && isProductSortField(sortField)
      ? { id: sortField, desc: params.get("dir") !== "asc" }
      : undefined;

  const result = await listProducts({
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
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const id = await createProduct({
    userId: session.user.id,
    input: parsed.data,
  });
  return NextResponse.json({ id }, { status: 201 });
};
