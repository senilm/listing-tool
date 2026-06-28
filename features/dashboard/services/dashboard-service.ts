import { and, count, desc, eq, isNull, max, notExists } from "drizzle-orm";

import {
  type AuditEventSummary,
  listAuditEvents,
} from "@/features/audit-log/services/audit-log-service";
import { db } from "@/lib/db/client";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { product } from "@/lib/db/schema/product";
import { publication } from "@/lib/db/schema/publication";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { PublicationStatus } from "@/lib/enums/publication";

const RECENT_LIMIT = 8;

export type AccountSummary = {
  id: string;
  label: string;
  status: EbayAccountStatus;
  liveCount: number;
  lastPublishedAt: Date | null;
};

export type DashboardStats = {
  productCount: number;
  productsNotLive: number;
  accounts: { total: number; active: number; needsReconsent: number };
  publications: Record<PublicationStatus, number>;
  accountsSummary: AccountSummary[];
  recent: AuditEventSummary[];
};

const emptyPublicationCounts = (): Record<PublicationStatus, number> =>
  Object.values(PublicationStatus).reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<PublicationStatus, number>,
  );

export const getDashboardStats = async ({
  userId,
}: {
  userId: string;
}): Promise<DashboardStats> => {
  const [
    productTotals,
    productsNotLiveTotals,
    accountRows,
    publicationRows,
    accountSummaryRows,
    recent,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(product)
      .where(and(eq(product.userId, userId), isNull(product.deletedAt))),
    db
      .select({ value: count() })
      .from(product)
      .where(
        and(
          eq(product.userId, userId),
          isNull(product.deletedAt),
          notExists(
            db
              .select()
              .from(publication)
              .where(
                and(
                  eq(publication.productId, product.id),
                  eq(publication.status, PublicationStatus.Published),
                ),
              ),
          ),
        ),
      ),
    db
      .select({ status: ebayAccount.status, value: count() })
      .from(ebayAccount)
      .where(and(eq(ebayAccount.userId, userId), isNull(ebayAccount.deletedAt)))
      .groupBy(ebayAccount.status),
    db
      .select({ status: publication.status, value: count() })
      .from(publication)
      .where(eq(publication.userId, userId))
      .groupBy(publication.status),
    db
      .select({
        id: ebayAccount.id,
        label: ebayAccount.label,
        status: ebayAccount.status,
        liveCount: count(publication.id),
        lastPublishedAt: max(publication.publishedAt),
      })
      .from(ebayAccount)
      .leftJoin(
        publication,
        and(
          eq(publication.ebayAccountId, ebayAccount.id),
          eq(publication.status, PublicationStatus.Published),
        ),
      )
      .where(and(eq(ebayAccount.userId, userId), isNull(ebayAccount.deletedAt)))
      .groupBy(ebayAccount.id, ebayAccount.label, ebayAccount.status)
      .orderBy(desc(count(publication.id))),
    listAuditEvents({ userId, limit: RECENT_LIMIT }),
  ]);

  const accounts = { total: 0, active: 0, needsReconsent: 0 };
  for (const row of accountRows) {
    const value = Number(row.value);
    accounts.total += value;
    if (row.status === EbayAccountStatus.Active) accounts.active = value;
    if (row.status === EbayAccountStatus.NeedsReconsent) {
      accounts.needsReconsent = value;
    }
  }

  const publications = emptyPublicationCounts();
  for (const row of publicationRows) {
    publications[row.status as PublicationStatus] = Number(row.value);
  }

  const accountsSummary: AccountSummary[] = accountSummaryRows.map((row) => ({
    id: row.id,
    label: row.label,
    status: row.status,
    liveCount: Number(row.liveCount),
    lastPublishedAt: row.lastPublishedAt,
  }));

  return {
    productCount: Number(productTotals[0]?.value ?? 0),
    productsNotLive: Number(productsNotLiveTotals[0]?.value ?? 0),
    accounts,
    publications,
    accountsSummary,
    recent,
  };
};
