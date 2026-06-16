# Publications Module Walkthrough

> Plain-English walkthrough of the publications feature, file by file, then an
> end-to-end flow trace. Covers `features/publications/**`, the publication DB
> schema/enum/validation, and the two `ebay-account-service` functions the
> publish path depends on. Every acronym is spelled out the first time it
> appears.

Publications = the record of "we published _this product_ to _this eBay
account_." One row per product-per-account. This module decides **when** to call
the eBay `publishListing` sequence (see `ebay-module.md`), **persists** the
result, and **shows** it in a table.

---

## The data shape

### `lib/enums/publication.ts` — lifecycle states

Single source of truth for both the Postgres enum column and the UI badge (so
they can't drift):

- **Draft** — created, nothing sent.
- **Scheduled** — meant to publish later (future cron feature; not wired yet).
- **Publishing** — in flight; eBay calls happening now.
- **Published** — live on eBay.
- **Failed** — eBay rejected it; `errorMessage` says why.
- **Ended** — was live, now taken down.

### `lib/db/schema/publication.ts` — the table

Key design decision: **content fields are a full snapshot, not live references.**

- `title`, `description`, `price`, `currency`, `quantity`, `categoryId`,
  `images`, `aspects` are copied onto the row at publish time (even though they
  also live on the product). **Why:** a past publication stays immune to later
  product edits — it's an audit trail of what was actually listed, not a live
  mirror.
- `overriddenFields` — which fields were manually changed away from the
  product's values (per-publication overrides). Seeded `[]` for now.
- eBay result fields: `ebaySku`, `ebayOfferId`, `ebayListingId` (the three IDs
  the 3-call publish returns). `errorMessage` for failures.
- `publishedAt` / `scheduledAt` timestamps (`scheduledAt` for future scheduling).
- Indexes on `userId`, `productId`, `ebayAccountId`, `status` — the columns we
  filter/sort by — for fast queries.
- All three foreign keys are `onDelete: cascade` — deleting a user/product/
  account removes its publications.

### `validations/publication.ts` — what the client may send

POST body is just `productId` + `accountIds` (min 1). The listing content is
**snapshotted server-side from the product** — the client only picks _which
product_ and _which accounts_. It can't inject a fake price/title; the server
reads those from the DB. Security + correctness.

---

## The brain: `features/publications/services/publication-service.ts`

The only file that touches the DB and eBay. Two exported functions.

### `listPublications()` — reads for the table

- `WHERE` scoped to `userId`, plus optional `statuses` (multi-select),
  `accountId` (per-account view), and `q` (title search).
- `SORTABLE_COLUMNS` is an **allow-list** (an explicit list of permitted values;
  anything not on it is rejected) of sortable columns (status,
  publishedAt, createdAt) — guards `ORDER BY` so a client can't pass an
  arbitrary column. Defaults to newest-first.
- `leftJoin` on `ebayAccount` to grab the account `label` (so the table shows
  "published to X" without a second query). Missing → "Unknown account".
- `viewUrlFor()` builds the eBay link from `ebayListingId` if present.
- Returns `{ items, total }`; `total` is a separate `count()` for pagination.

### `publishProductToAccounts()` — the publish orchestration

The most important function in the module:

1. `getProduct()` scoped to the user. Not found → `{ productFound: false }`
   (route turns this into 404).
2. `toListingAspects()` — converts jewellery fields into eBay's **aspects**
   format (structured item specifics: key → list of values). Merges dedicated
   columns (`brand`, `metal`, `metalPurity`, `mainStone`, `jewelleryType`,
   `ringSize`) into the free-form `aspects` JSON as e.g. `{ "Metal": ["Gold"] }`.
   Only non-empty values included.
3. Loop each account **sequentially** (rate-limit friendly; each account is
   independent — one failure doesn't stop the rest):
   - `buildEbaySku()` — per-account SKU (Stock Keeping Unit — a unique code
     identifying an inventory item on an account; no-cross-account-linkage rule).
   - **INSERT a publication row immediately, status `Publishing`** — so even if
     the process dies mid-publish there's a record. Snapshot fields filled here.
   - `try`: `getAccountAccessToken()` → `ensureSellerSetup()` →
     `publishListing()` (the 3 eBay calls) → on success **UPDATE** the row to
     `Published` with offer/listing IDs + `publishedAt`.
   - `catch`: UPDATE the row to `Failed` with the message. **No throw** — the
     loop continues to the next account.
4. Returns `{ productFound: true, results }` — one result per account.

> Strategic note in the code: pure publish logic lives in `lib/ebay/listing`;
> this only orchestrates + persists, so a future queue/cron trigger can reuse it
> unchanged.

### Its two dependencies in `features/ebay-accounts/services/ebay-account-service.ts`

- **`getAccountAccessToken()`** — reads the account (scoped to user), checks it's
  not disconnected and has a token. The **only place the encrypted refresh token
  is read**: `decryptToken()` in memory, immediately exchanged via
  `refreshAccessToken()` for a short-lived access token. Plaintext never
  persists.
- **`ensureSellerSetup()`** — returns the 4 policy/location IDs. Checks if all
  four are **already cached on the account row**; if so returns them (no eBay
  calls). Only on first publish does it call `resolveSellerSetup()` (the
  account-setup dance) and **cache the result onto the row**. eBay's policy/
  location IDs are stable per seller, so caching is safe. This is why
  account-setup runs once per account, not per listing.

---

## The plumbing layer

### `app/api/publications/route.ts` — the HTTP endpoint

- Both handlers wrapped in `withApi()` (shared middleware: injects the
  authenticated `session`, standardizes errors).
- **GET** — parses pagination/search/status-filter/sort from the URL via the
  shared `lib/api/*` parsers, calls `listPublications` scoped to the session user.
- **POST** — `parseBody` validates against `publishRequestSchema`, calls
  `publishProductToAccounts`, returns 404 if product not found, else `201` with
  results.

### `features/publications/services/publication-client.ts` — browser HTTP calls

- `fetchPublications` (GET) and `publishProductRequest` (POST) — plain `fetch`
  wrappers. Imports **types** from the service, but types are erased at build, so
  no server/DB/eBay code leaks into the client bundle.

### Hooks

- `use-publications-query.ts` — `usePublicationsQuery`; `keepPreviousData` keeps
  the old table visible while a new page/filter loads (no flicker).
- `use-publish-product.ts` — the publish mutation; on success **invalidates the
  publications query cache**, so every open table auto-refetches. The
  live-update mechanism.

---

## The UI

### `components/publish-product-dialog.tsx` — the "Publish to eBay" modal

- Opened from a product. Fetches the user's **active** eBay accounts
  (`status=active`, up to `MAX_LIMIT`); `enabled: open` queries only when open.
- Checkbox list; resets selection each open via the "adjust-state-during-render"
  pattern (the repo's lint-safe alternative to a sync `useEffect`).
- No active accounts → shows a "Connect one" link.
- On publish: calls the mutation, then **summarizes the multi-account outcome**
  into one toast — all succeeded → success, all failed → error, mixed → warning
  ("Published to 2, 1 failed"). Consumes the per-account `results` array.
- Publish button disabled until ≥1 account selected; shows the count.

### `components/publications-table.tsx` + `components/publication-columns.tsx`

- `PublicationsTable` wires the shared `DataTable` to `usePublicationsQuery` and
  the filter config.
- Columns: **Product**, **Account**, **Status** (badge + red error message
  underneath if failed), **Published** date, and a **"View on eBay"** row action
  (opens `viewUrl` in a new tab; disabled if not live). Product/Account aren't
  sortable (matches the service allow-list).

### `components/account-publications-table.tsx` + `account-publication-columns.tsx`

- Same table, scoped to **one account's** history (account detail page). Forces
  `accountId` into the query params; drops the redundant "Account" column.

### `components/publication-status-badge.tsx`

- Maps each status to a label + color: Published = green (success), Failed = red
  (destructive), Publishing/Scheduled = blue (info), Draft/Ended = grey
  (default). Pure presentation.

### `config/publication-filters.ts`

- Declares the **Status** multi-select filter (the chips above the table) with
  all six statuses. `PUBLICATION_FILTER_KEYS` is a stable module-level array
  (the table-params hook needs a stable reference).

---

## End-to-End Flow Trace: "Publish a product to 2 accounts"

```
USER clicks "Publish" on a product
  └─ PublishProductDialog opens
       └─ fetches active eBay accounts  (GET /api/ebay/accounts?status=active)
       └─ user ticks 2 accounts, clicks Publish
            └─ usePublishProduct.mutateAsync({ productId, accountIds: [A, B] })
                 └─ publishProductRequest()  →  POST /api/publications
                      └─ withApi: inject session, then publishProductToAccounts()
                           ├─ getProduct(productId, userId)            ← load + authorize
                           ├─ toListingAspects(product)                ← jewellery fields → eBay aspects
                           └─ for each account [A, B]  (sequential):
                                ├─ buildEbaySku()                       ← per-account SKU
                                ├─ INSERT publication row  status=Publishing
                                ├─ getAccountAccessToken()              ← decrypt refresh token → refreshAccessToken() → access token
                                ├─ ensureSellerSetup()                  ← cached IDs, or resolveSellerSetup() (opt-in + policies + location)
                                ├─ publishListing()                     ← 3 eBay calls:
                                │     1. PUT inventory_item/{sku}
                                │     2. POST offer
                                │     3. POST offer/{id}/publish
                                ├─ success → UPDATE row status=Published, save offerId/listingId/publishedAt
                                └─ failure → UPDATE row status=Failed, save errorMessage  (loop continues)
                      └─ return { results: [...] }  → 201
            └─ onSuccess: invalidate publications cache
                 └─ toast: "Published to 2 accounts" / "1 failed" etc.
                 └─ any open PublicationsTable refetches → new rows appear
```
