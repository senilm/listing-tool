import { type NextRequest, NextResponse } from "next/server";

import {
  archiveProduct,
  updateProduct,
} from "@/features/products/services/product-service";
import { requireSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/body";
import { productInputSchema } from "@/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const body = await parseBody(request, productInputSchema, "Invalid product");
  if (body.response) return body.response;

  const { id } = await params;
  const updated = await updateProduct({
    id,
    userId: session.user.id,
    input: body.data,
  });
  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};

// Soft delete — archives the product (keeps the row and its publications).
export const DELETE = async (
  request: NextRequest,
  { params }: RouteContext,
) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const { id } = await params;
  const archived = await archiveProduct({ id, userId: session.user.id });
  if (!archived) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};
