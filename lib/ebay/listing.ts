import { type SellerSetup } from "@/lib/ebay/account-setup";
import {
  ebayInventoryItemRoute,
  ebayOffersRoute,
  ebayPublishOfferRoute,
} from "@/lib/ebay/api-routes";
import { ebayRequest, EBAY_MARKETPLACE_ID } from "@/lib/ebay/client";
import { ebayConfig } from "@/lib/ebay/config";

// Fallback leaf category when a product has none set: Jewelry & Watches >
// Fashion Jewelry > Rings. Real per-product leaf selection comes later.
export const DEFAULT_CATEGORY_ID = "67681";

// eBay caps SKUs at 50 characters.
const EBAY_SKU_MAX_LENGTH = 50;
const SKU_TITLE_SLUG_LENGTH = 24;
const SKU_ACCOUNT_FRAGMENT_LENGTH = 8;

// SKUs are internal bookkeeping the user never sees (mirroring eBay's own UI,
// which has no required SKU). Generated fresh per publish: the title slug for
// readability, an account fragment so the same product never shares a SKU
// across accounts, and a timestamp so retries never collide with a stale
// offer left by an earlier failed publish.
export const buildEbaySku = ({
  title,
  accountId,
}: {
  title: string;
  accountId: string;
}): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SKU_TITLE_SLUG_LENGTH)
    .replace(/-+$/, "");
  const account = accountId
    .replace(/-/g, "")
    .slice(0, SKU_ACCOUNT_FRAGMENT_LENGTH);
  const stamp = Date.now().toString(36);

  return [slug, account, stamp]
    .filter(Boolean)
    .join("-")
    .slice(0, EBAY_SKU_MAX_LENGTH);
};

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
  await ebayRequest(accessToken, ebayInventoryItemRoute(sku), {
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

  try {
    // 2. Stage an unpublished offer tying the SKU to the marketplace.
    const offer = await ebayRequest<{ offerId: string }>(
      accessToken,
      ebayOffersRoute(),
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
          listingDuration: "GTC", // Good 'Til Cancelled
        },
      },
    );

    // 3. Publish the offer into a live eBay listing.
    const published = await ebayRequest<{ listingId: string }>(
      accessToken,
      ebayPublishOfferRoute(offer.data.offerId),
      { method: "POST" },
    );

    return {
      sku,
      offerId: offer.data.offerId,
      listingId: published.data.listingId,
      viewUrl: `${ebayConfig.webBase}/itm/${published.data.listingId}`,
    };
  } catch (error) {
    // SKUs are single-use, so a failed attempt would otherwise strand the
    // inventory item (and its unpublished offer) on the account forever.
    // Deleting the inventory item also deletes its unpublished offers.
    // Best-effort: the original failure is what the caller needs to see.
    await ebayRequest(accessToken, ebayInventoryItemRoute(sku), {
      method: "DELETE",
    }).catch(() => undefined);
    throw error;
  }
};
