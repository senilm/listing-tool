import { and, asc, count, desc, eq, ilike, isNull } from "drizzle-orm";

import { deleteManagedBlobs } from "@/lib/blob/cleanup";
import { db } from "@/lib/db/client";
import { likeContains } from "@/lib/db/like";
import { product } from "@/lib/db/schema/product";
import { EXPORT_ROW_LIMIT, type ExportResult } from "@/lib/export/types";
import { DEFAULT_CONDITION, type ProductInput } from "@/validations/product";

type ProductRow = typeof product.$inferSelect;

export type ProductSummary = Pick<
  ProductRow,
  | "id"
  | "title"
  | "basePrice"
  | "currency"
  | "quantity"
  | "createdAt"
  | "updatedAt"
>;

// Columns the table is allowed to sort by — guards against arbitrary input
// reaching the ORDER BY clause.
export const SORTABLE_COLUMNS = {
  title: product.title,
  basePrice: product.basePrice,
  quantity: product.quantity,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
} as const;

export type ProductSortField = keyof typeof SORTABLE_COLUMNS;

export type ListProductsParams = {
  userId: string;
  page: number;
  limit: number;
  q?: string;
  sort?: { id: ProductSortField; desc: boolean };
};

export type ListProductsResult = {
  items: ProductSummary[];
  total: number;
};

// Shared by the list and export queries so both apply identical filtering and
// ordering — only pagination differs.
type ProductQuery = Pick<ListProductsParams, "userId" | "q" | "sort">;

const PRODUCT_SUMMARY_SELECTION = {
  id: product.id,
  title: product.title,
  basePrice: product.basePrice,
  currency: product.currency,
  quantity: product.quantity,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
};

const productWhere = ({ userId, q }: ProductQuery) => {
  const conditions = [eq(product.userId, userId), isNull(product.deletedAt)];
  const trimmed = q?.trim();
  if (trimmed) conditions.push(ilike(product.title, likeContains(trimmed)));
  return and(...conditions);
};

const productOrderBy = (sort: ProductQuery["sort"]) => {
  const column = SORTABLE_COLUMNS[sort?.id ?? "updatedAt"];
  return sort?.desc === false ? asc(column) : desc(column);
};

// Paginated, scoped to the user. Soft-deleted products (deletedAt set) are
// always excluded.
export const listProducts = async (
  params: ListProductsParams,
): Promise<ListProductsResult> => {
  const where = productWhere(params);
  const offset = (params.page - 1) * params.limit;

  const items = await db
    .select(PRODUCT_SUMMARY_SELECTION)
    .from(product)
    .where(where)
    .orderBy(productOrderBy(params.sort))
    .limit(params.limit)
    .offset(offset);

  const [totals] = await db
    .select({ value: count() })
    .from(product)
    .where(where);

  return { items, total: Number(totals?.value ?? 0) };
};

// Every product matching the filters/sort, capped at EXPORT_ROW_LIMIT — for
// export. `total` is the unclamped count so the client can flag truncation.
export const listProductsForExport = async (
  params: ProductQuery,
): Promise<ExportResult<ProductSummary>> => {
  const where = productWhere(params);

  const items = await db
    .select(PRODUCT_SUMMARY_SELECTION)
    .from(product)
    .where(where)
    .orderBy(productOrderBy(params.sort))
    .limit(EXPORT_ROW_LIMIT);

  const [totals] = await db
    .select({ value: count() })
    .from(product)
    .where(where);
  const total = Number(totals?.value ?? 0);

  return { items, total, truncated: total > EXPORT_ROW_LIMIT };
};

type OwnedProduct = {
  id: string;
  userId: string;
};

export const getProduct = async ({
  id,
  userId,
}: OwnedProduct): Promise<ProductRow | null> => {
  const [row] = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.id, id),
        eq(product.userId, userId),
        isNull(product.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
};

const toRowValues = (input: ProductInput) => ({
  title: input.title,
  description: input.description,
  condition: DEFAULT_CONDITION,
  brand: input.brand,
  metal: input.metal,
  metalPurity: input.metalPurity,
  mainStone: input.mainStone,
  mainStoneCreation: input.mainStoneCreation,
  mainStoneTreatment: input.mainStoneTreatment,
  mainStoneColor: input.mainStoneColor,
  mainStoneShape: input.mainStoneShape,
  totalCaratWeight: input.totalCaratWeight,
  numberOfGemstones: input.numberOfGemstones,
  cutGrade: input.cutGrade,
  colorGrade: input.colorGrade,
  clarityGrade: input.clarityGrade,
  secondaryStone: input.secondaryStone,
  settingStyle: input.settingStyle,
  style: input.style,
  theme: input.theme,
  occasion: input.occasion,
  color: input.color,
  features: input.features,
  bandWidth: input.bandWidth,
  vintage: input.vintage,
  personalized: input.personalized,
  department: input.department,
  sizable: input.sizable,
  countryRegionOfManufacture: input.countryRegionOfManufacture,
  certification: input.certification,
  certificationNumber: input.certificationNumber,
  mpn: input.mpn,
  upc: input.upc,
  californiaProp65Warning: input.californiaProp65Warning,
  jewelleryType: input.jewelleryType,
  ringSize: input.ringSize,
  basePrice: input.basePrice,
  quantity: input.quantity,
  images: input.images,
  aspects: input.aspects,
});

export const createProduct = async ({
  userId,
  input,
}: {
  userId: string;
  input: ProductInput;
}): Promise<string> => {
  const [row] = await db
    .insert(product)
    .values({ userId, ...toRowValues(input) })
    .returning({ id: product.id });
  return row.id;
};

export const updateProduct = async ({
  id,
  userId,
  input,
}: OwnedProduct & { input: ProductInput }): Promise<boolean> => {
  const existing = await getProduct({ id, userId });
  if (!existing) return false;

  const result = await db
    .update(product)
    .set(toRowValues(input))
    .where(
      and(
        eq(product.id, id),
        eq(product.userId, userId),
        isNull(product.deletedAt),
      ),
    )
    .returning({ id: product.id });
  if (result.length === 0) return false;

  // Reclaim blobs removed from this product; the cron sweep backstops misses.
  const removed = (existing.images ?? []).filter(
    (url) => !input.images.includes(url),
  );
  await deleteManagedBlobs(removed);
  return true;
};

// Soft delete: stamp deletedAt so the row drops out of every list/lookup. The
// row (and its publications) stay in the DB. Already-deleted rows are a no-op.
export const deleteProduct = async ({
  id,
  userId,
}: OwnedProduct): Promise<boolean> => {
  const result = await db
    .update(product)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(product.id, id),
        eq(product.userId, userId),
        isNull(product.deletedAt),
      ),
    )
    .returning({ id: product.id });
  return result.length > 0;
};
