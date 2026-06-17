import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";

import { getAccountAccessToken } from "@/features/ebay-accounts/services/ebay-account-service";
import { getProduct } from "@/features/products/services/product-service";
import { db } from "@/lib/db/client";
import { likeContains } from "@/lib/db/like";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { publication } from "@/lib/db/schema/publication";
import { ebayConfig } from "@/lib/ebay/config";
import {
  buildEbaySku,
  DEFAULT_CATEGORY_ID,
  publishListing,
} from "@/lib/ebay/listing";
import { PublicationStatus } from "@/lib/enums/publication";
import {
  type PublishAccount,
  type PublishOverrides,
} from "@/validations/publication";

export type PublicationSummary = {
  id: string;
  productId: string;
  productTitle: string;
  accountLabel: string;
  status: PublicationStatus;
  ebayListingId: string | null;
  viewUrl: string | null;
  errorMessage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
};

// Columns the table is allowed to sort by — guards the ORDER BY clause.
export const SORTABLE_COLUMNS = {
  status: publication.status,
  publishedAt: publication.publishedAt,
  createdAt: publication.createdAt,
} as const;

export type PublicationSortField = keyof typeof SORTABLE_COLUMNS;

export type ListPublicationsParams = {
  userId: string;
  page: number;
  limit: number;
  q?: string;
  statuses?: PublicationStatus[];
  accountId?: string;
  sort?: { id: PublicationSortField; desc: boolean };
};

export type ListPublicationsResult = {
  items: PublicationSummary[];
  total: number;
};

const viewUrlFor = (listingId: string | null): string | null =>
  listingId ? `${ebayConfig.webBase}/itm/${listingId}` : null;

// Paginated, scoped to the user. Joins the product title and account label so
// the table can show what was published where without extra round-trips.
export const listPublications = async (
  params: ListPublicationsParams,
): Promise<ListPublicationsResult> => {
  const conditions = [eq(publication.userId, params.userId)];

  if (params.statuses && params.statuses.length > 0) {
    conditions.push(inArray(publication.status, params.statuses));
  }

  if (params.accountId) {
    conditions.push(eq(publication.ebayAccountId, params.accountId));
  }

  const q = params.q?.trim();
  if (q) conditions.push(ilike(publication.title, likeContains(q)));

  const where = and(...conditions);

  const column = SORTABLE_COLUMNS[params.sort?.id ?? "createdAt"];
  const orderBy = params.sort?.desc === false ? asc(column) : desc(column);

  const offset = (params.page - 1) * params.limit;

  const rows = await db
    .select({
      id: publication.id,
      productId: publication.productId,
      productTitle: publication.title,
      accountLabel: ebayAccount.label,
      status: publication.status,
      ebayListingId: publication.ebayListingId,
      errorMessage: publication.errorMessage,
      publishedAt: publication.publishedAt,
      createdAt: publication.createdAt,
    })
    .from(publication)
    .leftJoin(ebayAccount, eq(publication.ebayAccountId, ebayAccount.id))
    .where(where)
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(offset);

  const items: PublicationSummary[] = rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productTitle: row.productTitle,
    accountLabel: row.accountLabel ?? "Unknown account",
    status: row.status as PublicationStatus,
    ebayListingId: row.ebayListingId,
    viewUrl: viewUrlFor(row.ebayListingId),
    errorMessage: row.errorMessage,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
  }));

  const [totals] = await db
    .select({ value: count() })
    .from(publication)
    .where(where);

  return { items, total: Number(totals?.value ?? 0) };
};

type ProductSource = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

const toListingAspects = (source: ProductSource): Record<string, string[]> => {
  const dedicated: Record<string, string | null> = {
    Brand: source.brand,
    Metal: source.metal,
    "Metal Purity": source.metalPurity,
    "Main Stone": source.mainStone,
    Type: source.jewelleryType,
    "Ring Size": source.ringSize,
  };

  const aspects: Record<string, string[]> = { ...(source.aspects ?? {}) };
  for (const [name, value] of Object.entries(dedicated)) {
    const trimmed = value?.trim();
    if (trimmed) aspects[name] = [trimmed];
  }
  return aspects;
};

export type PublishResult = {
  accountId: string;
  publicationId: string;
  status: PublicationStatus.Published | PublicationStatus.Failed;
  error?: string;
};

export type PublishProductOutcome = {
  productFound: boolean;
  results: PublishResult[];
};

// The product fields a seller can override per account. Everything else in the
// snapshot (category, images, aspects) is inherited as-is.
type SnapshotFields = {
  title: string;
  description: string | null;
  price: string;
  quantity: number;
};

// Applies the per-account overrides over the product's values, returning the
// effective snapshot plus the list of fields that actually differ (so the row
// records what the seller changed, not every field they re-sent).
const applyOverrides = (
  base: SnapshotFields,
  overrides: PublishOverrides | undefined,
): { snapshot: SnapshotFields; overriddenFields: string[] } => {
  const snapshot = { ...base };
  const overriddenFields: string[] = [];

  if (overrides?.title && overrides.title !== base.title) {
    snapshot.title = overrides.title;
    overriddenFields.push("title");
  }
  if (
    overrides?.description !== undefined &&
    overrides.description !== base.description
  ) {
    snapshot.description = overrides.description;
    overriddenFields.push("description");
  }
  if (overrides?.price && overrides.price !== base.price) {
    snapshot.price = overrides.price;
    overriddenFields.push("price");
  }
  if (
    overrides?.quantity !== undefined &&
    overrides.quantity !== base.quantity
  ) {
    snapshot.quantity = overrides.quantity;
    overriddenFields.push("quantity");
  }

  return { snapshot, overriddenFields };
};

// Publishes one product to each target account, recording a publication row per
// account. Each account is handled sequentially (rate-limit friendly) and
// independently — one failure is recorded and the rest still run. Pure publish
// logic lives in lib/ebay/listing; this only orchestrates + persists, so a
// queue/cron trigger can reuse it unchanged later.
export const publishProductToAccounts = async ({
  userId,
  productId,
  accounts,
}: {
  userId: string;
  productId: string;
  accounts: PublishAccount[];
}): Promise<PublishProductOutcome> => {
  const source = await getProduct({ id: productId, userId });
  if (!source) return { productFound: false, results: [] };

  const aspects = toListingAspects(source);
  const base: SnapshotFields = {
    title: source.title,
    description: source.description,
    price: source.basePrice,
    quantity: source.quantity,
  };
  const results: PublishResult[] = [];

  for (const account of accounts) {
    const { accountId } = account;
    const { snapshot, overriddenFields } = applyOverrides(
      base,
      account.overrides,
    );
    const description = snapshot.description ?? snapshot.title;
    const ebaySku = buildEbaySku({ title: snapshot.title, accountId });
    const [row] = await db
      .insert(publication)
      .values({
        userId,
        productId,
        ebayAccountId: accountId,
        status: PublicationStatus.Publishing,
        title: snapshot.title,
        description: snapshot.description,
        price: snapshot.price,
        currency: source.currency,
        quantity: snapshot.quantity,
        categoryId: source.categoryId,
        images: source.images,
        aspects,
        overriddenFields,
        paymentPolicyId: account.paymentPolicyId,
        returnPolicyId: account.returnPolicyId,
        fulfillmentPolicyId: account.fulfillmentPolicyId,
        merchantLocationKey: account.merchantLocationKey,
        ebaySku,
      })
      .returning({ id: publication.id });

    try {
      const accessToken = await getAccountAccessToken({
        id: accountId,
        userId,
      });
      const result = await publishListing({
        accessToken,
        setup: {
          paymentPolicyId: account.paymentPolicyId,
          returnPolicyId: account.returnPolicyId,
          fulfillmentPolicyId: account.fulfillmentPolicyId,
          merchantLocationKey: account.merchantLocationKey,
        },
        listing: {
          sku: ebaySku,
          title: snapshot.title,
          description,
          categoryId: source.categoryId ?? DEFAULT_CATEGORY_ID,
          price: snapshot.price,
          quantity: snapshot.quantity,
          imageUrls: source.images ?? [],
          aspects,
        },
      });

      await db
        .update(publication)
        .set({
          status: PublicationStatus.Published,
          ebayOfferId: result.offerId,
          ebayListingId: result.listingId,
          publishedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(publication.id, row.id));

      results.push({
        accountId,
        publicationId: row.id,
        status: PublicationStatus.Published,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      await db
        .update(publication)
        .set({ status: PublicationStatus.Failed, errorMessage: message })
        .where(eq(publication.id, row.id));

      results.push({
        accountId,
        publicationId: row.id,
        status: PublicationStatus.Failed,
        error: message,
      });
    }
  }

  return { productFound: true, results };
};
