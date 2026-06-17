import { and, asc, count, desc, eq, ilike, inArray, isNull } from "drizzle-orm";

import { decryptToken, encryptToken } from "@/lib/crypto/token-cipher";
import { db } from "@/lib/db/client";
import { likeContains } from "@/lib/db/like";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import {
  type AccountListingOptions,
  createTestPolicies,
  fetchListingOptions,
} from "@/lib/ebay/account-setup";
import { refreshAccessToken } from "@/lib/ebay/oauth";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { EXPORT_ROW_LIMIT, type ExportResult } from "@/lib/export/types";

type EbayAccountRow = typeof ebayAccount.$inferSelect;

export type EbayAccountSummary = Pick<
  EbayAccountRow,
  "id" | "label" | "status" | "createdAt"
>;

// Columns the table is allowed to sort by — guards the ORDER BY clause.
export const SORTABLE_COLUMNS = {
  label: ebayAccount.label,
  createdAt: ebayAccount.createdAt,
} as const;

export type EbayAccountSortField = keyof typeof SORTABLE_COLUMNS;

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
  ebayUserId: string | null;
  label: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date | null;
  scopes: string[];
};

type OwnedAccount = {
  id: string;
  userId: string;
};

// Shared by the list and export queries so both apply identical filtering and
// ordering — only pagination differs.
type EbayAccountQuery = Pick<
  ListEbayAccountsParams,
  "userId" | "q" | "statuses" | "sort"
>;

const EBAY_ACCOUNT_SUMMARY_SELECTION = {
  id: ebayAccount.id,
  label: ebayAccount.label,
  status: ebayAccount.status,
  createdAt: ebayAccount.createdAt,
};

const ebayAccountWhere = ({ userId, q, statuses }: EbayAccountQuery) => {
  const conditions = [
    eq(ebayAccount.userId, userId),
    isNull(ebayAccount.deletedAt),
  ];
  if (statuses && statuses.length > 0) {
    conditions.push(inArray(ebayAccount.status, statuses));
  }
  const trimmed = q?.trim();
  if (trimmed) conditions.push(ilike(ebayAccount.label, likeContains(trimmed)));
  return and(...conditions);
};

const ebayAccountOrderBy = (sort: EbayAccountQuery["sort"]) => {
  const column = SORTABLE_COLUMNS[sort?.id ?? "createdAt"];
  return sort?.desc === false ? asc(column) : desc(column);
};

// Paginated, scoped to the user. The token column is never selected — callers
// only ever see metadata. Disconnected accounts (deletedAt set) are always
// excluded.
export const listEbayAccounts = async (
  params: ListEbayAccountsParams,
): Promise<ListEbayAccountsResult> => {
  const where = ebayAccountWhere(params);
  const offset = (params.page - 1) * params.limit;

  const items = await db
    .select(EBAY_ACCOUNT_SUMMARY_SELECTION)
    .from(ebayAccount)
    .where(where)
    .orderBy(ebayAccountOrderBy(params.sort))
    .limit(params.limit)
    .offset(offset);

  const [totals] = await db
    .select({ value: count() })
    .from(ebayAccount)
    .where(where);

  return { items, total: Number(totals?.value ?? 0) };
};

// Every account matching the filters/sort, capped at EXPORT_ROW_LIMIT — for
// export. `total` is the unclamped count so the client can flag truncation.
export const listEbayAccountsForExport = async (
  params: EbayAccountQuery,
): Promise<ExportResult<EbayAccountSummary>> => {
  const where = ebayAccountWhere(params);

  const items = await db
    .select(EBAY_ACCOUNT_SUMMARY_SELECTION)
    .from(ebayAccount)
    .where(where)
    .orderBy(ebayAccountOrderBy(params.sort))
    .limit(EXPORT_ROW_LIMIT);

  const [totals] = await db
    .select({ value: count() })
    .from(ebayAccount)
    .where(where);
  const total = Number(totals?.value ?? 0);

  return { items, total, truncated: total > EXPORT_ROW_LIMIT };
};

// Single account scoped to the user — same metadata shape as the list; the
// token column is never exposed.
export const getEbayAccount = async ({
  id,
  userId,
}: OwnedAccount): Promise<EbayAccountSummary | null> => {
  const [row] = await db
    .select({
      id: ebayAccount.id,
      label: ebayAccount.label,
      status: ebayAccount.status,
      createdAt: ebayAccount.createdAt,
    })
    .from(ebayAccount)
    .where(
      and(
        eq(ebayAccount.id, id),
        eq(ebayAccount.userId, userId),
        isNull(ebayAccount.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
};

// Reconnecting a known account (same eBay user ID) revives the existing row
// rather than creating a duplicate — including a previously disconnected
// (soft-deleted) one, which clears deletedAt. The existing label is kept so a
// rename survives reconnection. When the user ID is unknown (identity call
// unavailable, e.g. sandbox) we can't dedup, so we always insert.
export const linkEbayAccount = async (
  input: LinkEbayAccountInput,
): Promise<void> => {
  const refreshToken = encryptToken(input.refreshToken);

  if (input.ebayUserId) {
    const [existing] = await db
      .select({ id: ebayAccount.id })
      .from(ebayAccount)
      .where(
        and(
          eq(ebayAccount.userId, input.userId),
          eq(ebayAccount.ebayUserId, input.ebayUserId),
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
          deletedAt: null,
        })
        .where(eq(ebayAccount.id, existing.id));
      return;
    }
  }

  await db.insert(ebayAccount).values({
    userId: input.userId,
    label: input.label,
    ebayUserId: input.ebayUserId,
    refreshToken,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt,
    scopes: input.scopes,
  });
};

// Soft disconnect: stamp deletedAt so the row drops out of every list/lookup,
// and wipe the token. Reconnecting the same eBay account revives the row.
export const disconnectEbayAccount = async ({
  id,
  userId,
}: OwnedAccount): Promise<boolean> => {
  const result = await db
    .update(ebayAccount)
    .set({ deletedAt: new Date(), refreshToken: null })
    .where(
      and(
        eq(ebayAccount.id, id),
        eq(ebayAccount.userId, userId),
        isNull(ebayAccount.deletedAt),
      ),
    )
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
    .where(
      and(
        eq(ebayAccount.id, id),
        eq(ebayAccount.userId, userId),
        isNull(ebayAccount.deletedAt),
      ),
    )
    .returning({ id: ebayAccount.id });
  return result.length > 0;
};

// Mints a fresh, short-lived access token for one owned account. This is the
// only path that reads the encrypted refresh token; it's decrypted in memory
// and exchanged immediately. Throws if the account is missing, disconnected, or
// has no stored token.
export const getAccountAccessToken = async ({
  id,
  userId,
}: OwnedAccount): Promise<string> => {
  const [row] = await db
    .select({
      refreshToken: ebayAccount.refreshToken,
      deletedAt: ebayAccount.deletedAt,
    })
    .from(ebayAccount)
    .where(and(eq(ebayAccount.id, id), eq(ebayAccount.userId, userId)))
    .limit(1);

  if (!row) throw new Error("eBay account not found");
  if (row.deletedAt || !row.refreshToken) {
    throw new Error("eBay account is disconnected — reconnect it to publish");
  }

  const tokens = await refreshAccessToken(decryptToken(row.refreshToken));
  return tokens.access_token;
};

// Lists the account's existing eBay business policies + inventory locations so
// the publish UI can let the seller pick which to list under. Read-only — never
// creates anything.
export const getAccountListingOptions = async ({
  id,
  userId,
}: OwnedAccount): Promise<AccountListingOptions> => {
  const accessToken = await getAccountAccessToken({ id, userId });
  return fetchListingOptions(accessToken);
};

// Sandbox-only: seeds default business policies + a location on the account so
// the publish flow can be tested end-to-end, then returns the refreshed lists.
// Callers must gate this to the sandbox environment.
export const createAccountTestPolicies = async ({
  id,
  userId,
}: OwnedAccount): Promise<AccountListingOptions> => {
  const accessToken = await getAccountAccessToken({ id, userId });
  return createTestPolicies(accessToken);
};
