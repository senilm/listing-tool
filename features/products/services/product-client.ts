import { type ListProductsResult } from "@/features/products/services/product-service";
import { productApiRoute, productsApiRoute } from "@/lib/api-routes";
import { type ProductInput } from "@/validations/product";

// Client-side HTTP calls to the product API. The server service
// (product-service.ts) is the only code that touches the DB; this module is
// what React Query hooks talk to. The ListProductsResult import is type-only,
// so none of the server/db code is pulled into the client bundle.

const JSON_HEADERS = { "Content-Type": "application/json" };

export const fetchProducts = async (
  params: string,
  signal?: AbortSignal,
): Promise<ListProductsResult> => {
  const res = await fetch(`${productsApiRoute()}?${params}`, { signal });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json() as Promise<ListProductsResult>;
};

export const createProductRequest = async (
  input: ProductInput,
): Promise<{ id: string }> => {
  const res = await fetch(productsApiRoute(), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json() as Promise<{ id: string }>;
};

export const updateProductRequest = async (
  id: string,
  input: ProductInput,
): Promise<void> => {
  const res = await fetch(productApiRoute(id), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update product");
};

export const archiveProductRequest = async (id: string): Promise<void> => {
  const res = await fetch(productApiRoute(id), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to archive product");
};
