import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { product } from "@/lib/db/schema/product";
import { ProductStatus } from "@/lib/enums/product";
import { DEFAULT_CONDITION, type ProductInput } from "@/validations/product";

type ProductRow = typeof product.$inferSelect;

export type ProductSummary = Pick<
  ProductRow,
  | "id"
  | "sku"
  | "title"
  | "status"
  | "basePrice"
  | "currency"
  | "quantity"
  | "createdAt"
  | "updatedAt"
>;

// Columns the table is allowed to sort by — guards against arbitrary input
// reaching the ORDER BY clause.
const SORTABLE_COLUMNS = {
  title: product.title,
  basePrice: product.basePrice,
  quantity: product.quantity,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
} as const;

export type ProductSortField = keyof typeof SORTABLE_COLUMNS;

export const isProductSortField = (value: string): value is ProductSortField =>
  value in SORTABLE_COLUMNS;

export type ListProductsParams = {
  userId: string;
  page: number;
  limit: number;
  q?: string;
  statuses?: ProductStatus[];
  sort?: { id: ProductSortField; desc: boolean };
};

export type ListProductsResult = {
  items: ProductSummary[];
  total: number;
};

// Paginated, scoped to the user. Archived products are hidden unless the caller
// explicitly asks for them.
export const listProducts = async (
  params: ListProductsParams,
): Promise<ListProductsResult> => {
  const statuses =
    params.statuses && params.statuses.length > 0
      ? params.statuses
      : [ProductStatus.Active];

  const conditions = [
    eq(product.userId, params.userId),
    inArray(product.status, statuses),
  ];

  const q = params.q?.trim();
  if (q) {
    const search = or(
      ilike(product.title, `%${q}%`),
      ilike(product.sku, `%${q}%`),
    );
    if (search) conditions.push(search);
  }

  const where = and(...conditions);

  const column = SORTABLE_COLUMNS[params.sort?.id ?? "updatedAt"];
  const orderBy = params.sort?.desc === false ? asc(column) : desc(column);

  const offset = (params.page - 1) * params.limit;

  const items = await db
    .select({
      id: product.id,
      sku: product.sku,
      title: product.title,
      status: product.status,
      basePrice: product.basePrice,
      currency: product.currency,
      quantity: product.quantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })
    .from(product)
    .where(where)
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(offset);

  const [totals] = await db
    .select({ value: count() })
    .from(product)
    .where(where);

  return { items, total: Number(totals?.value ?? 0) };
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
    .where(and(eq(product.id, id), eq(product.userId, userId)))
    .limit(1);
  return row ?? null;
};

const toRowValues = (input: ProductInput) => ({
  sku: input.sku,
  title: input.title,
  description: input.description,
  condition: DEFAULT_CONDITION,
  brand: input.brand,
  metal: input.metal,
  metalPurity: input.metalPurity,
  mainStone: input.mainStone,
  jewelleryType: input.jewelleryType,
  ringSize: input.ringSize,
  basePrice: input.basePrice.toString(),
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
  const result = await db
    .update(product)
    .set(toRowValues(input))
    .where(and(eq(product.id, id), eq(product.userId, userId)))
    .returning({ id: product.id });
  return result.length > 0;
};

// Soft delete: keep the row (and its publications) but drop it from the default
// list. Reversible by flipping status back to Active.
export const archiveProduct = async ({
  id,
  userId,
}: OwnedProduct): Promise<boolean> => {
  const result = await db
    .update(product)
    .set({ status: ProductStatus.Archived })
    .where(and(eq(product.id, id), eq(product.userId, userId)))
    .returning({ id: product.id });
  return result.length > 0;
};
