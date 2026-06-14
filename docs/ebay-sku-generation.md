# SKU Generation — How It Works

Every eBay inventory item is keyed by a **SKU** (a seller's stock-keeping code).
We generate one automatically for each publish.

## The difference from eBay's website

On eBay's site a SKU (they call it a "Custom label") is **optional** — most casual
sellers leave it blank, and when they do set one it's a single value reused across
their listings.

We do the opposite, on purpose:

- The SKU is **never shown to the user** — it's internal bookkeeping.
- It's generated **fresh per publish**, and crucially **per account**.
- The same product published to two accounts gets **two different SKUs**.

The per-account part is a hard rule: eBay must never be able to tell that listings
on different accounts are the same product. A shared SKU would leak exactly that.
See [[no-cross-account-linkage]].

## How a SKU is built

`buildEbaySku` in `lib/ebay/listing.ts` joins three parts with `-`:

```
   <title-slug>          -   <account-fragment>   -   <timestamp>
   first 24 chars,           first 8 chars of         Date.now() in
   lowercase, a-z0-9         the account id,           base36
                             dashes removed
```

```ts
buildEbaySku({ title: "Diamond Solitaire Ring", accountId: "9f8c1d2e-4a..." });
// → "diamond-solitaire-ring-9f8c1d2e-lq3k7x9"
```

Each part earns its place:

| Part             | Why it's there                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| title slug       | Human-readable if you ever inspect raw data                                                                                           |
| account fragment | Guarantees a **different SKU per account** (no cross-account link)                                                                    |
| timestamp        | A failed publish leaves a single-use SKU spent; the stamp makes the **retry's SKU unique** so it never collides with a stranded offer |

The whole thing is capped at **50 characters** (eBay's SKU limit).

## Where it's used

```
publishProductToAccounts(...)          per account:
   const ebaySku = buildEbaySku({ title, accountId })
   → stored on the publication row (ebaySku column)
   → passed to publishListing() as the inventory-item key
```

The generated SKU is saved on the `publication` row, so each historical publish
keeps the exact SKU it used.

## Files

| File                                                    | Job                                  |
| ------------------------------------------------------- | ------------------------------------ |
| `lib/ebay/listing.ts`                                   | `buildEbaySku`                       |
| `features/publications/services/publication-service.ts` | Calls it once per account, stores it |
| `lib/db/schema/publication.ts`                          | `ebaySku` column                     |
