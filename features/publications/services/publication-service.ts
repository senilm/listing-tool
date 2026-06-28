import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";

import { getAccountAccessToken } from "@/features/ebay-accounts/services/ebay-account-service";
import { getProduct } from "@/features/products/services/product-service";
import { db } from "@/lib/db/client";
import { likeContains } from "@/lib/db/like";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { publication } from "@/lib/db/schema/publication";
import { ebayConfig } from "@/lib/ebay/config";
import { buildEbaySku, publishListing } from "@/lib/ebay/listing";
import { uploadImagesToEps } from "@/lib/ebay/media";
import { PublicationStatus } from "@/lib/enums/publication";
import { EXPORT_ROW_LIMIT, type ExportResult } from "@/lib/export/types";
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
  scheduledAt: Date | null;
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

// Shared by the list and export queries so both apply identical filtering and
// ordering — only pagination differs.
type PublicationQuery = Pick<
  ListPublicationsParams,
  "userId" | "q" | "statuses" | "accountId" | "sort"
>;

const PUBLICATION_SUMMARY_SELECTION = {
  id: publication.id,
  productId: publication.productId,
  productTitle: publication.title,
  accountLabel: ebayAccount.label,
  status: publication.status,
  ebayListingId: publication.ebayListingId,
  errorMessage: publication.errorMessage,
  scheduledAt: publication.scheduledAt,
  publishedAt: publication.publishedAt,
  createdAt: publication.createdAt,
};

const publicationWhere = ({
  userId,
  q,
  statuses,
  accountId,
}: PublicationQuery) => {
  const conditions = [eq(publication.userId, userId)];
  if (statuses && statuses.length > 0) {
    conditions.push(inArray(publication.status, statuses));
  }
  if (accountId) {
    conditions.push(eq(publication.ebayAccountId, accountId));
  }
  const trimmed = q?.trim();
  if (trimmed) conditions.push(ilike(publication.title, likeContains(trimmed)));
  return and(...conditions);
};

const publicationOrderBy = (sort: PublicationQuery["sort"]) => {
  const column = SORTABLE_COLUMNS[sort?.id ?? "createdAt"];
  return sort?.desc === false ? asc(column) : desc(column);
};

const selectPublications = (params: PublicationQuery) =>
  db
    .select(PUBLICATION_SUMMARY_SELECTION)
    .from(publication)
    .leftJoin(ebayAccount, eq(publication.ebayAccountId, ebayAccount.id))
    .where(publicationWhere(params))
    .orderBy(publicationOrderBy(params.sort));

type PublicationSelectRow = Awaited<
  ReturnType<typeof selectPublications>
>[number];

const toSummary = (row: PublicationSelectRow): PublicationSummary => ({
  id: row.id,
  productId: row.productId,
  productTitle: row.productTitle,
  accountLabel: row.accountLabel ?? "Unknown account",
  status: row.status as PublicationStatus,
  ebayListingId: row.ebayListingId,
  viewUrl: viewUrlFor(row.ebayListingId),
  errorMessage: row.errorMessage,
  scheduledAt: row.scheduledAt,
  publishedAt: row.publishedAt,
  createdAt: row.createdAt,
});

// Paginated, scoped to the user. Joins the product title and account label so
// the table can show what was published where without extra round-trips.
export const listPublications = async (
  params: ListPublicationsParams,
): Promise<ListPublicationsResult> => {
  const offset = (params.page - 1) * params.limit;

  const rows = await selectPublications(params)
    .limit(params.limit)
    .offset(offset);

  const [totals] = await db
    .select({ value: count() })
    .from(publication)
    .where(publicationWhere(params));

  return { items: rows.map(toSummary), total: Number(totals?.value ?? 0) };
};

// Every publication matching the filters/sort, capped at EXPORT_ROW_LIMIT — for
// export. `total` is the unclamped count so the client can flag truncation.
export const listPublicationsForExport = async (
  params: PublicationQuery,
): Promise<ExportResult<PublicationSummary>> => {
  const rows = await selectPublications(params).limit(EXPORT_ROW_LIMIT);

  const [totals] = await db
    .select({ value: count() })
    .from(publication)
    .where(publicationWhere(params));
  const total = Number(totals?.value ?? 0);

  return {
    items: rows.map(toSummary),
    total,
    truncated: total > EXPORT_ROW_LIMIT,
  };
};

type ProductSource = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

// Item specifics already live in the aspects bag (keyed by eBay aspect name),
// so publishing is a straight pass-through — no dedicated-column mapping.
const toListingAspects = (source: ProductSource): Record<string, string[]> => ({
  ...(source.aspects ?? {}),
});

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
    const snapshotValues = {
      userId,
      productId,
      ebayAccountId: accountId,
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
      scheduledAt: account.scheduledAt ?? null,
    };

    try {
      const accessToken = await getAccountAccessToken({
        id: accountId,
        userId,
      });

      // EPS URLs (not the shared Blob URL) are what the listing and snapshot
      // use — see uploadImagesToEps for why this keeps accounts unlinked.
      const epsImageUrls = await uploadImagesToEps(
        accessToken,
        source.images ?? [],
      );

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
          categoryId: source.categoryId,
          price: snapshot.price,
          quantity: snapshot.quantity,
          imageUrls: epsImageUrls,
          aspects,
          listingStartDate: account.scheduledAt?.toISOString(),
        },
      });

      const [row] = await db
        .insert(publication)
        .values({
          ...snapshotValues,
          images: epsImageUrls,
          status: PublicationStatus.Published,
          ebayOfferId: result.offerId,
          ebayListingId: result.listingId,
          publishedAt: new Date(),
        })
        .returning({ id: publication.id });

      results.push({
        accountId,
        publicationId: row.id,
        status: PublicationStatus.Published,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      const [row] = await db
        .insert(publication)
        .values({
          ...snapshotValues,
          status: PublicationStatus.Failed,
          errorMessage: message,
        })
        .returning({ id: publication.id });

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
