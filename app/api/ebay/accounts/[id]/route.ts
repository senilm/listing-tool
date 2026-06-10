import { type NextRequest, NextResponse } from "next/server";

import {
  disableEbayAccount,
  renameEbayAccount,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { auth } from "@/lib/auth/server";
import { renameEbayAccountSchema } from "@/validations/ebay-account";

type RouteContext = { params: Promise<{ id: string }> };

// Soft-disconnect: marks the account disabled and wipes its stored token.
export const DELETE = async (request: NextRequest, { params }: RouteContext) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const disabled = await disableEbayAccount({ id, userId: session.user.id });
  if (!disabled) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = renameEbayAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid label" }, { status: 400 });
  }

  const { id } = await params;
  const renamed = await renameEbayAccount({
    id,
    userId: session.user.id,
    label: parsed.data.label,
  });
  if (!renamed) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
};
