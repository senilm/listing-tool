# Publishing a Listing to eBay — How It Works

How we turn one stored product into a live eBay listing on a chosen account.
This is the core flow; account linking is covered in `docs/ebay-account-linking.md`.

## The big difference from eBay's website

On eBay's own site you list an item through **one "Sell your item" form** — you
fill in a single page (photos, title, price, shipping) and hit _List it_. eBay
hides all the plumbing.

We don't use that form at all. We talk to eBay's **Inventory API**, which splits
the same job into **three separate calls** that must run in order:

| Step | eBay website (UI) | Our app (Inventory API)                                 |
| ---- | ----------------- | ------------------------------------------------------- |
| 1    | — (implicit)      | **PUT inventory item** — the product data under a SKU   |
| 2    | — (implicit)      | **POST offer** — price, category, policies, marketplace |
| 3    | Click _List it_   | **POST offer/publish** — makes it go live               |

Why bother? Because we publish the **same product to many accounts** at once, and
an API lets us do that headlessly and repeatably. A human form can't.

## The flow

```
[Select product + target accounts → "Publish"]
   publish-product-dialog.tsx
   ↓ POST /api/publications  { productId, accountIds }
app/api/publications/route.ts (POST)
   • requireSession → 401 if none
   • publishProductToAccounts({ userId, productId, accountIds })
   ↓
features/publications/services/publication-service.ts
   for each accountId (sequential, rate-limit friendly):
     1. buildEbaySku(...)                     → unique per-account SKU
     2. INSERT publication row (status=Publishing)
     3. getAccountAccessToken(...)            → fresh token (token-refresh doc)
     4. ensureSellerSetup(...)                → policy + location IDs (seller-setup doc)
     5. publishListing({ accessToken, setup, listing })   ← the 3 eBay calls
     6. UPDATE row → Published (+ offerId, listingId)  OR  Failed (+ errorMessage)
```

The three eBay calls live in `lib/ebay/listing.ts`:

```ts
// 1. Create/replace the inventory item for this SKU
PUT  /sell/inventory/v1/inventory_item/{sku}
     { availability, condition: "NEW", product: { title, description, aspects, imageUrls } }

// 2. Stage an unpublished offer (SKU → marketplace + price + policies)
POST /sell/inventory/v1/offer
     { sku, marketplaceId: "EBAY_US", format: "FIXED_PRICE", categoryId,
       listingPolicies: { paymentPolicyId, returnPolicyId, fulfillmentPolicyId },
       pricingSummary: { price: { value, currency: "USD" } },
       merchantLocationKey, listingDuration: "GTC" }
     → { offerId }

// 3. Publish the offer into a live listing
POST /sell/inventory/v1/offer/{offerId}/publish
     → { listingId }
```

The returned `listingId` becomes a view URL: `{webBase}/itm/{listingId}`.

## Fixed defaults (for now)

Every listing is published with the same shape — there is no UI for these yet:

- Condition: **NEW**
- Currency: **USD**, Marketplace: **EBAY_US**
- Format: **FIXED_PRICE**, Duration: **GTC** (Good 'Til Cancelled)
- Category falls back to `DEFAULT_CATEGORY_ID` ("67681", Fashion Jewelry > Rings)
  when the product has none.

## If a step fails

SKUs are single-use. If step 2 or 3 throws, the inventory item from step 1 would
be stranded on the account forever, so `publishListing` **deletes the inventory
item** on failure (which also removes its unpublished offer) and re-throws the
original error. The publication row is then marked `Failed` with the message.

Each account is independent: one account failing does **not** stop the others.

## Files

| File                                                          | Job                                          |
| ------------------------------------------------------------- | -------------------------------------------- |
| `features/publications/components/publish-product-dialog.tsx` | Pick accounts, trigger publish               |
| `app/api/publications/route.ts` (POST)                        | Auth + call the service                      |
| `features/publications/services/publication-service.ts`       | Orchestrate per account + persist rows       |
| `lib/ebay/listing.ts`                                         | The pure 3-call publish sequence             |
| `lib/ebay/client.ts`                                          | `ebayRequest` — auth headers + sandbox retry |
