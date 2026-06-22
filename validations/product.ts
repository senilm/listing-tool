import { z } from "zod";

import { ProductCondition } from "@/lib/enums/product";
import {
  Certification,
  Department,
  MainStoneCreation,
  Metal,
  MetalPurity,
  RingStyle,
  SettingStyle,
  Sizable,
  Stone,
  StoneColor,
  StoneShape,
} from "@/lib/enums/product-aspects";

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

// --- Dropdown helpers ---------------------------------------------------------
// RHF holds "" for an unselected dropdown. A required dropdown rejects "";
// an optional one allows it and the mapper turns it into null on persist.

const requiredDropdown = <T extends Record<string, string>>(
  values: T,
  message: string,
) => z.union([z.enum(values), z.literal("")]).refine((v) => v !== "", message);

const optionalDropdown = <T extends Record<string, string>>(values: T) =>
  z.union([z.enum(values), z.literal("")]);

// --- Form shape ---------------------------------------------------------------
// What react-hook-form holds. Images and aspects are wrapped in objects so
// useFieldArray gets stable keys; the mappers below flatten them for the API.

const imageFormSchema = z.object({
  url: z
    .string()
    .trim()
    .pipe(z.url("Enter a valid image URL"))
    .refine(isImageFileUrl, IMAGE_FILE_NAME_MESSAGE),
});

const aspectFormSchema = z.object({
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
  brand: z.string().trim().min(1, "Enter a brand"),
  metal: requiredDropdown(Metal, "Select a metal"),
  metalPurity: requiredDropdown(MetalPurity, "Select a metal purity"),
  mainStone: requiredDropdown(Stone, "Select a main stone"),
  mainStoneCreation: optionalDropdown(MainStoneCreation),
  mainStoneColor: optionalDropdown(StoneColor),
  mainStoneShape: optionalDropdown(StoneShape),
  totalCaratWeight: z.string().trim(),
  secondaryStone: optionalDropdown(Stone),
  settingStyle: optionalDropdown(SettingStyle),
  style: optionalDropdown(RingStyle),
  department: optionalDropdown(Department),
  sizable: optionalDropdown(Sizable),
  countryRegionOfManufacture: z.string().trim(),
  certification: optionalDropdown(Certification),
  certificationNumber: z.string().trim(),
  jewelleryType: z.string().trim().min(1, "Enter a type"),
  ringSize: z.string().trim().min(1, "Enter a ring size"),
  basePrice: priceSchema,
  quantity: z
    .number({ message: "Enter a quantity" })
    .int("Quantity must be a whole number")
    .min(MIN_QUANTITY, "Quantity must be at least 1")
    .max(MAX_QUANTITY, "Quantity is too large"),
  images: z.array(imageFormSchema).max(MAX_IMAGES, IMAGES_MAX_MESSAGE),
  aspects: z.array(aspectFormSchema),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// --- Persistence shape --------------------------------------------------------
// What the API accepts and the service writes. Validated independently of the
// form (the client is untrusted).

export const productInputSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullable(),
  brand: z.string().trim().min(1),
  metal: z.enum(Metal),
  metalPurity: z.enum(MetalPurity),
  mainStone: z.enum(Stone),
  mainStoneCreation: z.enum(MainStoneCreation).nullable(),
  mainStoneColor: z.enum(StoneColor).nullable(),
  mainStoneShape: z.enum(StoneShape).nullable(),
  totalCaratWeight: z.string().trim().nullable(),
  secondaryStone: z.enum(Stone).nullable(),
  settingStyle: z.enum(SettingStyle).nullable(),
  style: z.enum(RingStyle).nullable(),
  department: z.enum(Department).nullable(),
  sizable: z.enum(Sizable).nullable(),
  countryRegionOfManufacture: z.string().trim().nullable(),
  certification: z.enum(Certification).nullable(),
  certificationNumber: z.string().trim().nullable(),
  jewelleryType: z.string().trim().min(1),
  ringSize: z.string().trim().min(1),
  basePrice: priceSchema,
  quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY),
  images: z
    .array(z.url().refine(isImageFileUrl, IMAGE_FILE_NAME_MESSAGE))
    .max(MAX_IMAGES, IMAGES_MAX_MESSAGE),
  aspects: z.record(z.string(), z.array(z.string())),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// --- Mappers ------------------------------------------------------------------

const nullIfEmpty = <T extends string>(value: T | ""): T | null =>
  value === "" ? null : value;

const textOrNull = (value: string): string | null =>
  value.trim() ? value.trim() : null;

export const toProductInput = (values: ProductFormValues): ProductInput => ({
  title: values.title.trim(),
  description: values.description.trim() ? values.description.trim() : null,
  brand: values.brand.trim(),
  metal: values.metal as Metal,
  metalPurity: values.metalPurity as MetalPurity,
  mainStone: values.mainStone as Stone,
  mainStoneCreation: nullIfEmpty(values.mainStoneCreation),
  mainStoneColor: nullIfEmpty(values.mainStoneColor),
  mainStoneShape: nullIfEmpty(values.mainStoneShape),
  totalCaratWeight: textOrNull(values.totalCaratWeight),
  secondaryStone: nullIfEmpty(values.secondaryStone),
  settingStyle: nullIfEmpty(values.settingStyle),
  style: nullIfEmpty(values.style),
  department: nullIfEmpty(values.department),
  sizable: nullIfEmpty(values.sizable),
  countryRegionOfManufacture: textOrNull(values.countryRegionOfManufacture),
  certification: nullIfEmpty(values.certification),
  certificationNumber: textOrNull(values.certificationNumber),
  jewelleryType: values.jewelleryType.trim(),
  ringSize: values.ringSize.trim(),
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
  title: string;
  description: string | null;
  brand: string | null;
  metal: string | null;
  metalPurity: string | null;
  mainStone: string | null;
  mainStoneCreation: string | null;
  mainStoneColor: string | null;
  mainStoneShape: string | null;
  totalCaratWeight: string | null;
  secondaryStone: string | null;
  settingStyle: string | null;
  style: string | null;
  department: string | null;
  sizable: string | null;
  countryRegionOfManufacture: string | null;
  certification: string | null;
  certificationNumber: string | null;
  jewelleryType: string | null;
  ringSize: string | null;
  basePrice: string;
  quantity: number;
  images: string[] | null;
  aspects: Record<string, string[]> | null;
};

export const toProductFormValues = (
  product: ProductFormSource,
): ProductFormValues => ({
  title: product.title,
  description: product.description ?? "",
  brand: product.brand ?? "",
  metal: (product.metal ?? "") as Metal | "",
  metalPurity: (product.metalPurity ?? "") as MetalPurity | "",
  mainStone: (product.mainStone ?? "") as Stone | "",
  mainStoneCreation: (product.mainStoneCreation ?? "") as
    | MainStoneCreation
    | "",
  mainStoneColor: (product.mainStoneColor ?? "") as StoneColor | "",
  mainStoneShape: (product.mainStoneShape ?? "") as StoneShape | "",
  totalCaratWeight: product.totalCaratWeight ?? "",
  secondaryStone: (product.secondaryStone ?? "") as Stone | "",
  settingStyle: (product.settingStyle ?? "") as SettingStyle | "",
  style: (product.style ?? "") as RingStyle | "",
  department: (product.department ?? "") as Department | "",
  sizable: (product.sizable ?? "") as Sizable | "",
  countryRegionOfManufacture: product.countryRegionOfManufacture ?? "",
  certification: (product.certification ?? "") as Certification | "",
  certificationNumber: product.certificationNumber ?? "",
  jewelleryType: product.jewelleryType ?? "",
  ringSize: product.ringSize ?? "",
  basePrice: product.basePrice,
  quantity: product.quantity,
  images: (product.images ?? []).map((url) => ({ url })),
  aspects: Object.entries(product.aspects ?? {}).map(([name, values]) => ({
    name,
    values: values.join(", "),
  })),
});
