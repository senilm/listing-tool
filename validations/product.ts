import { z } from "zod";

import { CategoryId } from "@/lib/categories/category-id";
import { FieldInput } from "@/lib/categories/field-def";
import { CATEGORY_REGISTRY } from "@/lib/categories/registry";
import { ProductCondition } from "@/lib/enums/product";

// Listings are USD-only and always brand new — the columns carry these for
// future flexibility, but we never surface a picker for either.
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_CONDITION = ProductCondition.New;

export const TITLE_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 4000;
export const MAX_IMAGES = 24;
const IMAGES_MAX_MESSAGE = `You can add up to ${MAX_IMAGES} images`;
export const MAX_IMAGE_MB = 10;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const MAX_PRICE = 9_999_999.99;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 1_000_000;

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export const priceSchema = z
  .string()
  .trim()
  .regex(PRICE_PATTERN, "Enter a valid price")
  .refine((value) => Number(value) > 0, "Price must be greater than 0")
  .refine((value) => Number(value) <= MAX_PRICE, "Price is too large");

export const isValidPriceString = (value: string): boolean =>
  priceSchema.safeParse(value).success;

// eBay's publish step rejects gallery URLs whose path lacks a file name
// ("Gallery URL has no file name"), so the URL path must end in an image file.
const IMAGE_FILE_NAME_PATTERN = /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i;

const isImageFileUrl = (value: string): boolean => {
  try {
    return IMAGE_FILE_NAME_PATTERN.test(new URL(value).pathname);
  } catch {
    return false;
  }
};

const IMAGE_FILE_NAME_MESSAGE =
  "URL must end in an image file name (e.g. .jpg)";

// RHF holds "" for an unselected dropdown. A required dropdown rejects "". Kept
// generic on purpose: the generic refine predicate doesn't narrow the inferred
// type, so the form value stays `T | ""` and the resolver/useForm types agree.
const requiredDropdown = <T extends Record<string, string>>(
  values: T,
  message: string,
) => z.union([z.enum(values), z.literal("")]).refine((v) => v !== "", message);

// Splits a comma-separated input into a trimmed, non-empty value list.
const splitValues = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// --- Form shape ---------------------------------------------------------------
// What react-hook-form holds. Category-specific item specifics live in the
// `aspects` map (keyed by eBay aspect name); the category registry decides which
// keys are rendered and which are required. Images and custom aspects are
// wrapped/arrayed so useFieldArray gets stable keys; the mappers flatten them.

const imageFormSchema = z.object({
  url: z
    .string()
    .trim()
    .pipe(z.url("Enter a valid image URL"))
    .refine(isImageFileUrl, IMAGE_FILE_NAME_MESSAGE),
});

const customAspectFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name"),
  // Comma-separated in the form; split into a string[] by the mapper.
  values: z.string().trim().min(1, "Add at least one value"),
});

export const productFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title")
    .max(
      TITLE_MAX_LENGTH,
      `Keep the title under ${TITLE_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters`,
    ),
  categoryId: requiredDropdown(CategoryId, "Select a category"),
  basePrice: priceSchema,
  quantity: z
    .number({ message: "Enter a quantity" })
    .int("Quantity must be a whole number")
    .min(MIN_QUANTITY, "Quantity must be at least 1")
    .max(MAX_QUANTITY, "Quantity is too large"),
  images: z.array(imageFormSchema).max(MAX_IMAGES, IMAGES_MAX_MESSAGE),
  // aspectName -> raw input value. Optional because dynamically-rendered fields
  // start absent from the record (undefined) until first edited; the mappers and
  // required-aspect check treat absent/empty the same.
  aspects: z.record(z.string(), z.string().optional()),
  customAspects: z.array(customAspectFormSchema),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// The selected category's required aspects that are still empty. The form checks
// these on submit and surfaces an error on each matching aspects.<name> field —
// kept out of the Zod schema so it stays a plain object (clean resolver types).
export const missingRequiredAspects = (
  categoryId: CategoryId,
  aspects: Record<string, string | undefined>,
): string[] =>
  CATEGORY_REGISTRY[categoryId].fields
    .filter((field) => field.required && !aspects[field.aspect]?.trim())
    .map((field) => field.aspect);

// --- Persistence shape --------------------------------------------------------
// What the API accepts and the service writes. Validated independently of the
// form (the client is untrusted). Item specifics all live in the `aspects` bag,
// keyed by eBay aspect name; the category decides which aspects belong.

export const productInputSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullable(),
  categoryId: z.enum(CategoryId),
  basePrice: priceSchema,
  quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY),
  images: z
    .array(z.url().refine(isImageFileUrl, IMAGE_FILE_NAME_MESSAGE))
    .max(MAX_IMAGES, IMAGES_MAX_MESSAGE),
  aspects: z.record(z.string(), z.array(z.string())),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// --- Mappers ------------------------------------------------------------------

// Builds the aspects bag from the selected category's registered fields plus the
// free-form custom aspects. Only fields belonging to the chosen category are
// included, so switching category drops values left behind by the previous one.
export const toProductInput = (values: ProductFormValues): ProductInput => {
  const categoryId = values.categoryId as CategoryId;
  const aspects: Record<string, string[]> = {};

  for (const custom of values.customAspects) {
    const name = custom.name.trim();
    const parsed = splitValues(custom.values);
    if (name && parsed.length > 0) aspects[name] = parsed;
  }

  for (const field of CATEGORY_REGISTRY[categoryId].fields) {
    const raw = values.aspects[field.aspect]?.trim();
    if (!raw) continue;
    aspects[field.aspect] =
      field.input === FieldInput.MultiSelect ? splitValues(raw) : [raw];
  }

  return {
    title: values.title.trim(),
    description: values.description.trim() ? values.description.trim() : null,
    categoryId,
    basePrice: values.basePrice,
    quantity: values.quantity,
    images: values.images.map((image) => image.url.trim()).filter(Boolean),
    aspects,
  };
};

// The fields toProductFormValues needs from a stored product row. Structural so
// validations stay decoupled from the Drizzle schema.
export type ProductFormSource = {
  title: string;
  description: string | null;
  categoryId: string;
  basePrice: string;
  quantity: number;
  images: string[] | null;
  aspects: Record<string, string[]> | null;
};

export const toProductFormValues = (
  product: ProductFormSource,
): ProductFormValues => {
  const bag = product.aspects ?? {};
  const config = CATEGORY_REGISTRY[product.categoryId as CategoryId] as
    | (typeof CATEGORY_REGISTRY)[CategoryId]
    | undefined;

  const aspects: Record<string, string> = {};
  const known = new Set<string>();
  for (const field of config?.fields ?? []) {
    known.add(field.aspect);
    aspects[field.aspect] = (bag[field.aspect] ?? []).join(", ");
  }

  return {
    title: product.title,
    description: product.description ?? "",
    categoryId: config ? (product.categoryId as CategoryId) : "",
    basePrice: product.basePrice,
    quantity: product.quantity,
    images: (product.images ?? []).map((url) => ({ url })),
    aspects,
    // Anything stored that the category doesn't define surfaces as a custom row.
    customAspects: Object.entries(bag)
      .filter(([name]) => !known.has(name))
      .map(([name, values]) => ({ name, values: values.join(", ") })),
  };
};
