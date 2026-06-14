# Publication Tracking — How It Works

A **publication** is one record of "this product was sent to this eBay account."
It's how we show what was published where, with what result. The act of publishing
is covered in `docs/ebay-publish-listing.md`; this doc is about the records it
leaves behind.

## The difference from eBay's website

eBay's Seller Hub shows a seller their listings as **Active / Sold / Unsold**, but
only **for the one account they're logged into**. There's no cross-account view —
each account is a separate login.

Our publication table is the opposite: it's a **local history across every linked
account**. One product fanned out to three accounts produces three publication
rows, side by side, each with its own status, eBay listing ID, and any error. We
keep our own copy rather than asking eBay, so the view is instant and spans
accounts eBay would never show together.

Each row is also a **full snapshot** of what was published (title, price, images,
aspects), so it stays accurate even if the underlying product is edited later.

## Lifecycle

A row's `status` moves through the `PublicationStatus` enum:

```
Draft → Scheduled → Publishing → Published
                              ↘  Failed
                                 (Ended — for later)
```

In practice today a publish inserts the row at **Publishing**, then updates it to
**Published** (with `ebayOfferId`, `ebayListingId`, `publishedAt`) or **Failed**
(with `errorMessage`). `Draft`, `Scheduled`, and `Ended` exist in the enum for
future scheduling/lifecycle work but aren't driven yet.

## Reading the history

```
publications table (UI)
   ↓ GET /api/publications?page&limit&q&statuses&accountId&sort
app/api/publications/route.ts (GET)
   • requireSession → 401 if none
   • listPublications({ userId, page, limit, q, statuses, accountId, sort })
   ↓
features/publications/services/publication-service.ts
   SELECT … FROM publication
     LEFT JOIN ebay_account  (to show the account label)
     WHERE userId = …  [+ status / accountId / title-search filters]
   → { items: PublicationSummary[], total }
```

The query is always scoped to the user, can be filtered by **status**, by a
specific **account**, or by a title **search**, and is sorted by status /
publishedAt / createdAt. The eBay listing ID is turned into a clickable view URL:

```ts
viewUrl = listingId ? `${webBase}/itm/${listingId}` : null;
```

## What each row carries

From `lib/db/schema/publication.ts` — the fields that make it a self-contained record:

- **Links:** `userId`, `productId`, `ebayAccountId`
- **Result:** `status`, `ebayOfferId`, `ebayListingId`, `publishedAt`, `errorMessage`
- **Snapshot:** `title`, `description`, `price`, `currency`, `quantity`,
  `categoryId`, `images`, `aspects`, `ebaySku`
- `overriddenFields` — which snapshot fields differ from the live product (for
  per-publish overrides; full editing UI is future work).

## Files

| File                                                    | Job                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `app/api/publications/route.ts` (GET)                   | Auth + call the list service                               |
| `features/publications/services/publication-service.ts` | `listPublications` (read) + writes the rows during publish |
| `lib/db/schema/publication.ts`                          | The snapshot + status columns                              |
| `lib/enums/publication.ts`                              | `PublicationStatus` lifecycle                              |
