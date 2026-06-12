import { type NextRequest, NextResponse } from "next/server";

import {
  createProduct,
  isProductSortField,
  listProducts,
} from "@/features/products/services/product-service";
import { requireSession } from "@/lib/api/auth";
import { parseListParams } from "@/lib/api/list-params";
import { ProductStatus } from "@/lib/enums/product";
import { productInputSchema } from "@/validations/product";

export const GET = async (request: NextRequest) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const { page, limit, q, statuses, sort } = parseListParams(
    request.nextUrl.searchParams,
    { statusEnum: ProductStatus, isSortField: isProductSortField },
  );

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
  const { session, response } = await requireSession(request);
  if (response) return response;

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
