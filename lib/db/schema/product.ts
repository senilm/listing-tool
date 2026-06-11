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
import { ProductStatus } from "@/lib/enums/product";

export const productStatusEnum = pgEnum(
  "product_status",
  Object.values(ProductStatus) as [string, ...string[]],
);

// The master listing. Stored once, then fanned out to many eBay accounts as
// publications (each a full snapshot of these fields at publish time).
export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sku: text("sku"),
    title: text("title").notNull(),
    description: text("description"),
    condition: text("condition"),
    brand: text("brand"),
    metal: text("metal"),
    metalPurity: text("metal_purity"),
    mainStone: text("main_stone"),
    jewelleryType: text("jewellery_type"),
    ringSize: text("ring_size"),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    categoryId: text("category_id"),
    quantity: integer("quantity").notNull().default(1),
    images: jsonb("images").$type<string[]>(),
    aspects: jsonb("aspects").$type<Record<string, string[]>>(),
    status: productStatusEnum("status")
      .$type<ProductStatus>()
      .notNull()
      .default(ProductStatus.Active),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("product_user_id_idx").on(table.userId)],
);
