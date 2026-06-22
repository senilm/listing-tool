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
    brand: text("brand"),
    metal: text("metal"),
    metalPurity: text("metal_purity"),
    mainStone: text("main_stone"),
    mainStoneCreation: text("main_stone_creation"),
    mainStoneColor: text("main_stone_color"),
    mainStoneShape: text("main_stone_shape"),
    totalCaratWeight: text("total_carat_weight"),
    secondaryStone: text("secondary_stone"),
    settingStyle: text("setting_style"),
    style: text("style"),
    department: text("department"),
    sizable: text("sizable"),
    countryRegionOfManufacture: text("country_region_of_manufacture"),
    certification: text("certification"),
    certificationNumber: text("certification_number"),
    jewelleryType: text("jewellery_type"),
    ringSize: text("ring_size"),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    categoryId: text("category_id"),
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
