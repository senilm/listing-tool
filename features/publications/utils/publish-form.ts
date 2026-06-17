import { type ProductSummary } from "@/features/products/services/product-service";
import {
  isValidPriceString,
  MAX_QUANTITY,
  MIN_QUANTITY,
  TITLE_MAX_LENGTH,
} from "@/validations/product";
import { type PublishOverrides } from "@/validations/publication";

// The editable state of one account's tab in the publish flow: the overridable
// product fields (as strings, the way inputs hold them) plus the chosen
// policy/location IDs.
export type AccountPublishForm = {
  title: string;
  description: string;
  price: string;
  quantity: string;
  paymentPolicyId: string;
  returnPolicyId: string;
  fulfillmentPolicyId: string;
  merchantLocationKey: string;
};

// Content prefilled from the product; policies left blank for a deliberate pick.
export const seedForm = (product: ProductSummary): AccountPublishForm => ({
  title: product.title,
  description: "",
  price: product.basePrice,
  quantity: String(product.quantity),
  paymentPolicyId: "",
  returnPolicyId: "",
  fulfillmentPolicyId: "",
  merchantLocationKey: "",
});

// A tab is publishable once all four policies are picked and the content fields
// are individually valid. Mirrors the server-side publishAccountSchema.
export const isFormValid = (form: AccountPublishForm): boolean => {
  const title = form.title.trim();
  const quantity = Number(form.quantity);
  return (
    form.paymentPolicyId !== "" &&
    form.returnPolicyId !== "" &&
    form.fulfillmentPolicyId !== "" &&
    form.merchantLocationKey !== "" &&
    title.length > 0 &&
    title.length <= TITLE_MAX_LENGTH &&
    isValidPriceString(form.price) &&
    Number.isInteger(quantity) &&
    quantity >= MIN_QUANTITY &&
    quantity <= MAX_QUANTITY
  );
};

// Builds the per-account overrides, sending only fields the seller changed from
// the product. The server snapshots the rest.
export const buildOverrides = (
  form: AccountPublishForm,
  product: ProductSummary,
): PublishOverrides | undefined => {
  const overrides: PublishOverrides = {};
  const title = form.title.trim();
  if (title && title !== product.title) overrides.title = title;
  const description = form.description.trim();
  if (description) overrides.description = description;
  if (form.price && form.price !== product.basePrice) {
    overrides.price = form.price;
  }
  const quantity = Number(form.quantity);
  if (Number.isInteger(quantity) && quantity !== product.quantity) {
    overrides.quantity = quantity;
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined;
};
