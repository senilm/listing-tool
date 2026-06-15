import { type NextRequest, NextResponse } from "next/server";

import {
  deleteProduct,
  updateProduct,
} from "@/features/products/services/product-service";
import { parseBody } from "@/lib/api/body";
import { NotFoundError } from "@/lib/api/errors";
import { withApi } from "@/lib/api/with-api";
import { productInputSchema } from "@/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withApi(
  async (request: NextRequest, { params }: RouteContext, session) => {
    const input = await parseBody(
      request,
      productInputSchema,
      "Invalid product",
    );

    const { id } = await params;
    const updated = await updateProduct({
      id,
      userId: session.user.id,
      input,
    });
    if (!updated) {
      throw new NotFoundError("Product not found");
    }
    return NextResponse.json({ success: true });
  },
);

// Soft delete — stamps deletedAt (keeps the row and its publications).
export const DELETE = withApi(
  async (_request: NextRequest, { params }: RouteContext, session) => {
    const { id } = await params;
    const deleted = await deleteProduct({ id, userId: session.user.id });
    if (!deleted) {
      throw new NotFoundError("Product not found");
    }
    return NextResponse.json({ success: true });
  },
);
