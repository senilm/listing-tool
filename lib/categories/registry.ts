import { CategoryId } from "@/lib/categories/category-id";
import { type FieldDef } from "@/lib/categories/field-def";
import { earringsFields } from "@/lib/categories/fields/earrings";
import { engagementRingsFields } from "@/lib/categories/fields/engagement-rings";
import { fashionRingsFields } from "@/lib/categories/fields/fashion-rings";
import { necklacesPendantsFields } from "@/lib/categories/fields/necklaces-pendants";
import { ringSetsFields } from "@/lib/categories/fields/ring-sets";
import { weddingBandsFields } from "@/lib/categories/fields/wedding-bands";

// One entry per eBay leaf category. Each category's item-specific fields live in
// their own file under ./fields and are assembled here — intentionally no shared
// field constant, so a category can be tweaked in isolation. Core listing fields
// (title, description, price, quantity, images, condition) are NOT here; they
// live as real product columns.

export type CategoryConfig = {
  id: CategoryId;
  label: string;
  fields: FieldDef[];
};

export const CATEGORY_REGISTRY: Record<CategoryId, CategoryConfig> = {
  [CategoryId.FashionRings]: {
    id: CategoryId.FashionRings,
    label: "Fashion Rings",
    fields: fashionRingsFields,
  },
  [CategoryId.EngagementRings]: {
    id: CategoryId.EngagementRings,
    label: "Engagement Rings",
    fields: engagementRingsFields,
  },
  [CategoryId.WeddingBands]: {
    id: CategoryId.WeddingBands,
    label: "Wedding & Anniversary Bands",
    fields: weddingBandsFields,
  },
  [CategoryId.RingSets]: {
    id: CategoryId.RingSets,
    label: "Engagement & Wedding Ring Sets",
    fields: ringSetsFields,
  },
  [CategoryId.NecklacesPendants]: {
    id: CategoryId.NecklacesPendants,
    label: "Necklaces & Pendants",
    fields: necklacesPendantsFields,
  },
  [CategoryId.Earrings]: {
    id: CategoryId.Earrings,
    label: "Earrings",
    fields: earringsFields,
  },
};
