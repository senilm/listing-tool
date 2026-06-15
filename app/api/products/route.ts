import { type NextRequest, NextResponse } from "next/server";

import {
  createProduct,
  isProductSortField,
  listProducts,
} from "@/features/products/services/product-service";
import { parseBody } from "@/lib/api/body";
import { parseListParams } from "@/lib/api/list-params";
import { withApi } from "@/lib/api/with-api";
import { productInputSchema } from "@/validations/product";

export const GET = withApi(async (request: NextRequest, _context, session) => {
  const { page, limit, q, sort } = parseListParams(
    request.nextUrl.searchParams,
    { isSortField: isProductSortField },
  );

  const result = await listProducts({
    userId: session.user.id,
    page,
    limit,
    q,
    sort,
  });

  return NextResponse.json(result);
});

export const POST = withApi(async (request: NextRequest, _context, session) => {
  const input = await parseBody(request, productInputSchema, "Invalid product");

  const id = await createProduct({
    userId: session.user.id,
    input,
  });
  return NextResponse.json({ id }, { status: 201 });
});
