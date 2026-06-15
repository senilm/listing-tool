import { type NextRequest, NextResponse } from "next/server";

import {
  disableEbayAccount,
  renameEbayAccount,
} from "@/features/ebay-accounts/services/ebay-account-service";
import { parseBody } from "@/lib/api/body";
import { NotFoundError } from "@/lib/api/errors";
import { withApi } from "@/lib/api/with-api";
import { renameEbayAccountSchema } from "@/validations/ebay-account";

type RouteContext = { params: Promise<{ id: string }> };

// Soft-disconnect: marks the account disabled and wipes its stored token.
export const DELETE = withApi(
  async (_request: NextRequest, { params }: RouteContext, session) => {
    const { id } = await params;
    const disabled = await disableEbayAccount({ id, userId: session.user.id });
    if (!disabled) {
      throw new NotFoundError("Account not found");
    }
    return NextResponse.json({ success: true });
  },
);

export const PATCH = withApi(
  async (request: NextRequest, { params }: RouteContext, session) => {
    const { label } = await parseBody(
      request,
      renameEbayAccountSchema,
      "Invalid label",
    );

    const { id } = await params;
    const renamed = await renameEbayAccount({
      id,
      userId: session.user.id,
      label,
    });
    if (!renamed) {
      throw new NotFoundError("Account not found");
    }
    return NextResponse.json({ success: true });
  },
);
