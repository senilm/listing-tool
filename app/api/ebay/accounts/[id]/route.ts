import { type NextRequest, NextResponse } from "next/server";

import {
  disableEbayAccount,
  renameEbayAccount,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { requireSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/body";
import { notFound } from "@/lib/api/responses";
import { renameEbayAccountSchema } from "@/validations/ebay-account";

type RouteContext = { params: Promise<{ id: string }> };

// Soft-disconnect: marks the account disabled and wipes its stored token.
export const DELETE = async (
  request: NextRequest,
  { params }: RouteContext,
) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const { id } = await params;
  const disabled = await disableEbayAccount({ id, userId: session.user.id });
  if (!disabled) {
    return notFound("Account not found");
  }
  return NextResponse.json({ success: true });
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const { session, response } = await requireSession(request);
  if (response) return response;

  const body = await parseBody(
    request,
    renameEbayAccountSchema,
    "Invalid label",
  );
  if (body.response) return body.response;

  const { id } = await params;
  const renamed = await renameEbayAccount({
    id,
    userId: session.user.id,
    label: body.data.label,
  });
  if (!renamed) {
    return notFound("Account not found");
  }
  return NextResponse.json({ success: true });
};
