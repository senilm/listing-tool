import { type SellerSetup } from "@/lib/ebay/account-setup";
import { ebayRequest, EBAY_MARKETPLACE_ID } from "@/lib/ebay/client";
import { ebayConfig } from "@/lib/ebay/config";

// Fallback leaf category when a product has none set: Jewelry & Watches >
// Fashion Jewelry > Rings. Real per-product leaf selection comes later.
export const DEFAULT_CATEGORY_ID = "67681";

export type ListingInput = {
  sku: string;
  title: string;
  description: string;
  categoryId: string;
  price: string;
  quantity: number;
  imageUrls: string[];
  aspects: Record<string, string[]>;
};

export type ListingResult = {
  sku: string;
  offerId: string;
  listingId: string;
  viewUrl: string;
};

type PublishListingArgs = {
  accessToken: string;
  setup: SellerSetup;
  listing: ListingInput;
};

// The pure 3-call Inventory API publish sequence. Trigger-agnostic — it takes a
// resolved access token, the seller's policy/location IDs, and the listing
// snapshot, and performs no DB access of its own. Listings are always NEW / USD.
export const publishListing = async ({
  accessToken,
  setup,
  listing,
}: PublishListingArgs): Promise<ListingResult> => {
  const { sku, quantity, description } = listing;

  // 1. Create/replace the inventory item for this SKU.
  await ebayRequest(accessToken, `/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    body: {
      availability: { shipToLocationAvailability: { quantity } },
      condition: "NEW",
      product: {
        title: listing.title,
        description,
        aspects: listing.aspects,
        imageUrls: listing.imageUrls,
      },
    },
  });

  // 2. Stage an unpublished offer tying the SKU to the marketplace.
  const offer = await ebayRequest<{ offerId: string }>(
    accessToken,
    "/sell/inventory/v1/offer",
    {
      method: "POST",
      body: {
        sku,
        marketplaceId: EBAY_MARKETPLACE_ID,
        format: "FIXED_PRICE",
        availableQuantity: quantity,
        categoryId: listing.categoryId,
        listingDescription: description,
        listingPolicies: {
          paymentPolicyId: setup.paymentPolicyId,
          returnPolicyId: setup.returnPolicyId,
          fulfillmentPolicyId: setup.fulfillmentPolicyId,
        },
        pricingSummary: { price: { value: listing.price, currency: "USD" } },
        merchantLocationKey: setup.merchantLocationKey,
        listingDuration: "GTC",
      },
    },
  );

  // 3. Publish the offer into a live eBay listing.
  const published = await ebayRequest<{ listingId: string }>(
    accessToken,
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
