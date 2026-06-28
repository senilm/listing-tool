import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";

// The master listing. Stored once, then fanned out to many eBay accounts as
// publications (each a full snapshot of these fields at publish time).
//
// Item-specific fields are NOT columns — they live in the `aspects` bag keyed by
// eBay aspect name. Which fields a category exposes is defined by the category
// registry (lib/categories), not the table. Only cross-cutting listing fields
// are columns here.
export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    condition: text("condition"),
    categoryId: text("category_id").notNull(),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    quantity: integer("quantity").notNull().default(1),
    images: jsonb("images").$type<string[]>(),
    aspects: jsonb("aspects").$type<Record<string, string[]>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("product_user_id_idx").on(table.userId)],
);
