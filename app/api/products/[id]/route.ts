import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import {
  archiveProduct,
  updateProduct,
} from "@/features/products/services/product-service";
import { productInputSchema } from "@/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const { id } = await params;
  const updated = await updateProduct({
    id,
    userId: session.user.id,
    input: parsed.data,
  });
  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};

// Soft delete — archives the product (keeps the row and its publications).
export const DELETE = async (request: NextRequest, { params }: RouteContext) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const archived = await archiveProduct({ id, userId: session.user.id });
  if (!archived) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};
