import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";

export enum EbayAccountStatus {
  Active = "active",
  NeedsReconsent = "needs_reconsent",
  Disabled = "disabled",
}

export const ebayAccountStatusEnum = pgEnum(
  "ebay_account_status",
  Object.values(EbayAccountStatus) as [string, ...string[]],
);

// One linked eBay seller account per row. The refresh token is stored ENCRYPTED
// at rest (encryption handled in the service layer, not the schema).
export const ebayAccount = pgTable(
  "ebay_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    ebayUsername: text("ebay_username"),
    refreshToken: text("refresh_token").notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scopes: jsonb("scopes").$type<string[]>(),
    status: ebayAccountStatusEnum("status").notNull().default(EbayAccountStatus.Active),
    paymentPolicyId: text("payment_policy_id"),
    returnPolicyId: text("return_policy_id"),
    fulfillmentPolicyId: text("fulfillment_policy_id"),
    merchantLocationKey: text("merchant_location_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("ebay_account_user_id_idx").on(table.userId)],
);
