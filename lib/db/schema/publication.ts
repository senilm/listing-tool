import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";
import { ebayAccount } from "@/lib/db/schema/ebay-account";
import { product } from "@/lib/db/schema/product";
import { PublicationStatus } from "@/lib/enums/publication";

export const publicationStatusEnum = pgEnum(
  "publication_status",
  Object.values(PublicationStatus) as [string, ...string[]],
);

// One product published to one eBay account. Content fields are a
// full snapshot seeded from the product and individually overridable, so past
// publications are immune to later product edits.
export const publication = pgTable(
  "publication",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    ebayAccountId: uuid("ebay_account_id")
      .notNull()
      .references(() => ebayAccount.id, { onDelete: "cascade" }),
    status: publicationStatusEnum("status").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    title: text("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    quantity: integer("quantity").notNull(),
    categoryId: text("category_id"),
    images: jsonb("images").$type<string[]>(),
    aspects: jsonb("aspects").$type<Record<string, string[]>>(),
    overriddenFields: jsonb("overridden_fields").$type<string[]>(),
    paymentPolicyId: text("payment_policy_id"),
    returnPolicyId: text("return_policy_id"),
    fulfillmentPolicyId: text("fulfillment_policy_id"),
    merchantLocationKey: text("merchant_location_key"),
    ebaySku: text("ebay_sku"),
    ebayOfferId: text("ebay_offer_id"),
    ebayListingId: text("ebay_listing_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("publication_user_id_idx").on(table.userId),
    index("publication_product_id_idx").on(table.productId),
    index("publication_ebay_account_id_idx").on(table.ebayAccountId),
    index("publication_status_idx").on(table.status),
  ],
);
