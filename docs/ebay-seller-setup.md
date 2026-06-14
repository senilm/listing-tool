# Seller Setup (Policies & Location) — How It Works

Before an offer can be published, eBay needs four things attached to it: a
**payment policy**, a **return policy**, a **fulfillment (shipping) policy**, and
a **merchant location**. This flow resolves those IDs automatically.

## The difference from eBay's website

On eBay's site, a seller sets these up **by hand, once**, in the account settings:
they open _Business Policies_, create a payment/return/shipping policy, add a
ship-from location, and save. Listings then reference whatever policies the seller
picked in the form.

We never show that screen. On the **first publish** to an account, the app:

1. Opts the account into Business Policies (eBay requires it for the Inventory API).
2. Looks for existing policies/location — and if none exist, **creates sensible
   defaults itself**.
3. **Caches the four IDs** onto the `ebay_account` row, so later publishes skip
   all of this.

So setup that's a manual chore on eBay's site is invisible and one-time here.

## The flow

```
publishProductToAccounts(...)            (per account, on every publish)
   ↓
ensureSellerSetup({ id, userId, accessToken })   ← features/ebay-accounts/services/ebay-account-service.ts
   • Row already has all 4 IDs cached?  → return them, do nothing.   (the common case)
   • Otherwise → resolveSellerSetup(accessToken), then cache the IDs on the row.
   ↓
resolveSellerSetup(accessToken)          ← lib/ebay/account-setup.ts
   • ensureOptedIn()                     POST /sell/account/v1/program/opt_in
   • Promise.all([
       resolvePaymentPolicy(),           GET, else POST /sell/account/v1/payment_policy
       resolveReturnPolicy(),            GET, else POST /sell/account/v1/return_policy
       resolveFulfillmentPolicy(),       GET, else POST /sell/account/v1/fulfillment_policy
       resolveLocation(),                GET, else POST /sell/inventory/v1/location/{key}
     ])
   → { paymentPolicyId, returnPolicyId, fulfillmentPolicyId, merchantLocationKey }
```

Each `resolve*` follows the same **"find one, else create a default"** pattern:

```ts
const { data } = await ebayRequest(token, ebayReturnPolicyRoute(), {
  query: { marketplace_id: "EBAY_US" },
});
if (data.returnPolicies?.length) return data.returnPolicies[0].returnPolicyId; // reuse
// else create a default and return its new id
```

## The defaults we create

| Policy      | Default we create                                             |
| ----------- | ------------------------------------------------------------- |
| Payment     | "Default Payment Policy"                                      |
| Return      | 30-day returns accepted, buyer pays return shipping           |
| Fulfillment | 1-day handling, free domestic USPS Priority (flat rate)       |
| Location    | "Primary Warehouse" key `warehouse-1`, a San Jose, CA address |

These are placeholders to make publishing work end-to-end; per-product or
per-account customisation isn't built yet.

## Why caching matters

`ensureSellerSetup` only calls eBay when an ID is missing. Once cached, every
future publish reads the four IDs straight from the row — no extra API round
trips. eBay's policy and location IDs are stable per seller, so caching is safe.

## Sandbox quirks (handled)

- `GET /location` is flaky in sandbox (errorId 25001), so we try it but fall back
  to a **keyed create**, which is idempotent.
- A "location already exists" error (errorId 25803) on create is treated as success.
- Re-opting into Business Policies is a harmless no-op error and is ignored.

## Files

| File                                                      | Job                                           |
| --------------------------------------------------------- | --------------------------------------------- |
| `lib/ebay/account-setup.ts`                               | The `resolve*` helpers + `resolveSellerSetup` |
| `features/ebay-accounts/services/ebay-account-service.ts` | `ensureSellerSetup` — cache check + persist   |
| `lib/db/schema/ebay-account.ts`                           | Where the four IDs are cached                 |
