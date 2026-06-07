import { resolveSellerSetup } from "@/lib/ebay/account-setup";
import { ebayRequest, EBAY_MARKETPLACE_ID } from "@/lib/ebay/client";
import { ebayConfig } from "@/lib/ebay/config";

export type ListingInput = {
  sku?: string;
  title?: string;
  description?: string;
  categoryId?: string;
  price?: string;
  quantity?: number;
  imageUrls?: string[];
  aspects?: Record<string, string[]>;
};

export type ListingResult = {
  sku: string;
  offerId: string;
  listingId: string;
  viewUrl: string;
};

// A self-contained sample jewellery product so an empty request still publishes.
const sampleListing = () => ({
  sku: `poc-ring-${Date.now()}`,
  title: "Sterling Silver Cubic Zirconia Solitaire Ring",
  description: "Elegant 925 sterling silver ring with a brilliant cubic zirconia solitaire.",
  categoryId: "67681", // Jewelry & Watches > Fashion Jewelry > Rings
  price: "49.99",
  quantity: 5,
  imageUrls: ["https://picsum.photos/seed/ring/800/800.jpg"],
  aspects: {
    Brand: ["Unbranded"],
    Metal: ["Sterling Silver"],
    "Metal Purity": ["925"],
    "Main Stone": ["Cubic Zirconia"],
    Type: ["Statement Ring"],
    "Ring Size": ["7"],
  } as Record<string, string[]>,
});

export const publishListing = async (input: ListingInput = {}): Promise<ListingResult> => {
  const sample = sampleListing();
  const sku = input.sku ?? sample.sku;
  const quantity = input.quantity ?? sample.quantity;
  const description = input.description ?? sample.description;

  const setup = await resolveSellerSetup();

  // 1. Create/replace the product record for this SKU.
  await ebayRequest(`/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    body: {
      availability: { shipToLocationAvailability: { quantity } },
      condition: "NEW",
      product: {
        title: input.title ?? sample.title,
        description,
        aspects: input.aspects ?? sample.aspects,
        imageUrls: input.imageUrls ?? sample.imageUrls,
      },
    },
  });

  // 2. Stage an unpublished offer tying the SKU to the marketplace.
  const offer = await ebayRequest<{ offerId: string }>("/sell/inventory/v1/offer", {
    method: "POST",
    body: {
      sku,
      marketplaceId: EBAY_MARKETPLACE_ID,
      format: "FIXED_PRICE",
      availableQuantity: quantity,
      categoryId: input.categoryId ?? sample.categoryId,
      listingDescription: description,
      listingPolicies: {
        paymentPolicyId: setup.paymentPolicyId,
        returnPolicyId: setup.returnPolicyId,
        fulfillmentPolicyId: setup.fulfillmentPolicyId,
      },
      pricingSummary: { price: { value: input.price ?? sample.price, currency: "USD" } },
      merchantLocationKey: setup.merchantLocationKey,
      listingDuration: "GTC",
    },
  });

  // 3. Publish the offer into a live eBay listing.
  const published = await ebayRequest<{ listingId: string }>(
    `/sell/inventory/v1/offer/${offer.data.offerId}/publish`,
    { method: "POST" },
  );

  return {
    sku,
    offerId: offer.data.offerId,
    listingId: published.data.listingId,
    viewUrl: `${ebayConfig.webBase}/itm/${published.data.listingId}`,
  };
};
