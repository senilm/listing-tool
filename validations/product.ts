import { z } from "zod";

import { ProductCondition } from "@/lib/enums/product";

// Listings are USD-only and always brand new — the columns carry these for
// future flexibility, but we never surface a picker for either.
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_CONDITION = ProductCondition.New;

const MAX_PRICE = 9_999_999.99;
const MAX_QUANTITY = 1_000_000;

// --- Form shape ---------------------------------------------------------------
// What react-hook-form holds. Images and aspects are wrapped in objects so
// useFieldArray gets stable keys; the mappers below flatten them for the API.

const imageFormSchema = z.object({
  url: z.string().trim().pipe(z.url("Enter a valid image URL")),
});

const aspectFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name"),
  // Comma-separated in the form; split into a string[] by the mapper.
  values: z.string().trim().min(1, "Add at least one value"),
});

export const productFormSchema = z.object({
  sku: z.string().trim().max(100, "Keep the SKU under 100 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title")
    .max(200, "Keep the title under 200 characters"),
  description: z
    .string()
    .trim()
    .max(4000, "Keep the description under 4000 characters"),
  basePrice: z
    .number({ message: "Enter a price" })
    .positive("Price must be greater than 0")
    .max(MAX_PRICE, "Price is too large"),
  quantity: z
    .number({ message: "Enter a quantity" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity can't be negative")
    .max(MAX_QUANTITY, "Quantity is too large"),
  images: z.array(imageFormSchema),
  aspects: z.array(aspectFormSchema),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// --- Persistence shape --------------------------------------------------------
// What the API accepts and the service writes. Validated independently of the
// form (the client is untrusted).

export const productInputSchema = z.object({
  sku: z.string().trim().max(100).nullable(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable(),
  basePrice: z.number().positive().max(MAX_PRICE),
  quantity: z.number().int().min(0).max(MAX_QUANTITY),
  images: z.array(z.url()),
  aspects: z.record(z.string(), z.array(z.string())),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// --- Mappers ------------------------------------------------------------------

export const toProductInput = (values: ProductFormValues): ProductInput => ({
  sku: values.sku.trim() ? values.sku.trim() : null,
  title: values.title.trim(),
  description: values.description.trim() ? values.description.trim() : null,
  basePrice: values.basePrice,
  quantity: values.quantity,
  images: values.images.map((image) => image.url.trim()).filter(Boolean),
  aspects: Object.fromEntries(
    values.aspects
      .map(
        (aspect) =>
          [
            aspect.name.trim(),
            aspect.values
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
          ] as const,
      )
      .filter(([name, values]) => name.length > 0 && values.length > 0),
  ),
});

// The fields toProductFormValues needs from a stored product row. Structural so
// validations stay decoupled from the Drizzle schema.
export type ProductFormSource = {
  sku: string | null;
  title: string;
  description: string | null;
  basePrice: string;
  quantity: number;
  images: string[] | null;
  aspects: Record<string, string[]> | null;
};

export const toProductFormValues = (
  product: ProductFormSource,
): ProductFormValues => ({
  sku: product.sku ?? "",
  title: product.title,
  description: product.description ?? "",
  basePrice: Number(product.basePrice),
  quantity: product.quantity,
  images: (product.images ?? []).map((url) => ({ url })),
  aspects: Object.entries(product.aspects ?? {}).map(([name, values]) => ({
    name,
    values: values.join(", "),
  })),
});
