import { and, desc, eq } from "drizzle-orm";

import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { encryptToken } from "@/lib/crypto/token-cipher";

type EbayAccountRow = typeof ebayAccount.$inferSelect;

export type EbayAccountSummary = Pick<
  EbayAccountRow,
  "id" | "label" | "ebayUsername" | "status" | "createdAt"
>;

type LinkEbayAccountInput = {
  userId: string;
  ebayUsername: string | null;
  refreshToken: string;
  refreshTokenExpiresAt: Date | null;
  scopes: string[];
};

type OwnedAccount = {
  id: string;
  userId: string;
};

// Scoped to the signed-in user (the (app) layout guard guarantees a session).
// The token column is never selected — callers only ever see metadata.
export const listEbayAccounts = async (): Promise<EbayAccountSummary[]> => {
  const session = await requireSession();
  return db
    .select({
      id: ebayAccount.id,
      label: ebayAccount.label,
      ebayUsername: ebayAccount.ebayUsername,
      status: ebayAccount.status,
      createdAt: ebayAccount.createdAt,
    })
    .from(ebayAccount)
    .where(eq(ebayAccount.userId, session.user.id))
    .orderBy(desc(ebayAccount.createdAt));
};

// Reconnecting a known account (same eBay username) revives the existing row
// rather than creating a duplicate. Username-less links always insert.
export const linkEbayAccount = async (
  input: LinkEbayAccountInput,
): Promise<void> => {
  const refreshToken = encryptToken(input.refreshToken);

  if (input.ebayUsername) {
    const [existing] = await db
      .select({ id: ebayAccount.id })
      .from(ebayAccount)
      .where(
        and(
          eq(ebayAccount.userId, input.userId),
          eq(ebayAccount.ebayUsername, input.ebayUsername),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(ebayAccount)
        .set({
          refreshToken,
          refreshTokenExpiresAt: input.refreshTokenExpiresAt,
          scopes: input.scopes,
          status: EbayAccountStatus.Active,
        })
        .where(eq(ebayAccount.id, existing.id));
      return;
    }
  }

  await db.insert(ebayAccount).values({
    userId: input.userId,
    label: input.ebayUsername ?? "eBay account",
    ebayUsername: input.ebayUsername,
    refreshToken,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt,
    scopes: input.scopes,
  });
};

// Soft disconnect: keep the row for history, but flip status and wipe the token.
export const disableEbayAccount = async ({
  id,
  userId,
}: OwnedAccount): Promise<boolean> => {
  const result = await db
    .update(ebayAccount)
    .set({ status: EbayAccountStatus.Disabled, refreshToken: null })
    .where(and(eq(ebayAccount.id, id), eq(ebayAccount.userId, userId)))
    .returning({ id: ebayAccount.id });
  return result.length > 0;
};

export const renameEbayAccount = async ({
  id,
  userId,
  label,
}: OwnedAccount & { label: string }): Promise<boolean> => {
  const result = await db
    .update(ebayAccount)
    .set({ label })
    .where(and(eq(ebayAccount.id, id), eq(ebayAccount.userId, userId)))
    .returning({ id: ebayAccount.id });
  return result.length > 0;
};
