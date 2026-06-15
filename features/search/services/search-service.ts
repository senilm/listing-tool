import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { likeContains } from "@/lib/db/like";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { product } from "@/lib/db/schema/product";
import { publication } from "@/lib/db/schema/publication";

const RESULTS_PER_GROUP = 5;

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string | null;
};

export type GlobalSearchResult = {
  products: SearchResultItem[];
  accounts: SearchResultItem[];
  publications: SearchResultItem[];
};

export const globalSearch = async ({
  userId,
  q,
}: {
  userId: string;
  q: string;
}): Promise<GlobalSearchResult> => {
  const term = likeContains(q);

  const [products, accounts, publications] = await Promise.all([
    db
      .select({ id: product.id, title: product.title })
      .from(product)
      .where(
        and(
          eq(product.userId, userId),
          isNull(product.deletedAt),
          ilike(product.title, term),
        ),
      )
      .orderBy(desc(product.updatedAt))
      .limit(RESULTS_PER_GROUP),
    db
      .select({
        id: ebayAccount.id,
        title: ebayAccount.label,
        subtitle: ebayAccount.ebayUsername,
      })
      .from(ebayAccount)
      .where(
        and(
          eq(ebayAccount.userId, userId),
          isNull(ebayAccount.deletedAt),
          or(
            ilike(ebayAccount.label, term),
            ilike(ebayAccount.ebayUsername, term),
          ),
        ),
      )
      .orderBy(desc(ebayAccount.createdAt))
      .limit(RESULTS_PER_GROUP),
    db
      .select({
        id: publication.id,
        title: publication.title,
        subtitle: ebayAccount.label,
      })
      .from(publication)
      .leftJoin(ebayAccount, eq(publication.ebayAccountId, ebayAccount.id))
      .where(
        and(eq(publication.userId, userId), ilike(publication.title, term)),
      )
      .orderBy(desc(publication.createdAt))
      .limit(RESULTS_PER_GROUP),
  ]);

  return {
    products: products.map((row) => ({ ...row, subtitle: null })),
    accounts,
    publications,
  };
};
