import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { encryptToken } from "@/lib/crypto/token-cipher";

type EbayAccountRow = typeof ebayAccount.$inferSelect;

export type EbayAccountSummary = Pick<
  EbayAccountRow,
  "id" | "label" | "ebayUsername" | "status" | "createdAt"
>;

// Columns the table is allowed to sort by — guards the ORDER BY clause.
const SORTABLE_COLUMNS = {
  label: ebayAccount.label,
  ebayUsername: ebayAccount.ebayUsername,
  createdAt: ebayAccount.createdAt,
} as const;

export type EbayAccountSortField = keyof typeof SORTABLE_COLUMNS;

export const isEbayAccountSortField = (
  value: string,
): value is EbayAccountSortField => value in SORTABLE_COLUMNS;

export type ListEbayAccountsParams = {
  userId: string;
  page: number;
  limit: number;
  q?: string;
  statuses?: EbayAccountStatus[];
  sort?: { id: EbayAccountSortField; desc: boolean };
};

export type ListEbayAccountsResult = {
  items: EbayAccountSummary[];
  total: number;
};

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

// Paginated, scoped to the user. The token column is never selected — callers
// only ever see metadata. No default status filter: disabled accounts stay
// visible (history) unless the caller narrows it.
export const listEbayAccounts = async (
  params: ListEbayAccountsParams,
): Promise<ListEbayAccountsResult> => {
  const conditions = [eq(ebayAccount.userId, params.userId)];

  if (params.statuses && params.statuses.length > 0) {
    conditions.push(inArray(ebayAccount.status, params.statuses));
  }

  const q = params.q?.trim();
  if (q) {
    const search = or(
      ilike(ebayAccount.label, `%${q}%`),
      ilike(ebayAccount.ebayUsername, `%${q}%`),
    );
    if (search) conditions.push(search);
  }

  const where = and(...conditions);

  const column = SORTABLE_COLUMNS[params.sort?.id ?? "createdAt"];
  const orderBy = params.sort?.desc === false ? asc(column) : desc(column);

  const offset = (params.page - 1) * params.limit;

  const items = await db
    .select({
      id: ebayAccount.id,
      label: ebayAccount.label,
      ebayUsername: ebayAccount.ebayUsername,
      status: ebayAccount.status,
      createdAt: ebayAccount.createdAt,
    })
    .from(ebayAccount)
    .where(where)
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(offset);

  const [totals] = await db
    .select({ value: count() })
    .from(ebayAccount)
    .where(where);

  return { items, total: Number(totals?.value ?? 0) };
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
