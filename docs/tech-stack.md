# Listing Tool — Tech Stack & Architecture Decisions

Decisions for the jewellery multi-account eBay listing tool. See `docs/schema.md` for
the data model.

## Stack

| Layer          | Choice                               | Why                                                                                                               |
| -------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router) + TypeScript | Already set up; route handlers serve as the backend.                                                              |
| **Hosting**    | Vercel                               | Zero-config Next.js deploys, preview environments.                                                                |
| **Database**   | Neon (serverless Postgres)           | Free tier, Vercel-native, scales to zero. Schema is relational with multi-way queries, so Postgres over DynamoDB. |
| **ORM**        | Drizzle                              | SQL-first, strong TS inference, serverless-friendly, pairs with Neon's HTTP driver and Better Auth.               |
| **Auth**       | Better Auth                          | Email + password, sessions in Postgres. Full control, minimal lock-in.                                            |
| **Validation** | Zod                                  | Shared schemas across API input and forms.                                                                        |
| **UI**         | shadcn/ui + Tailwind v4              | Already installed.                                                                                                |

> **Implementation notes**
>
> - **DB driver**: `drizzle-orm/neon-http` + `@neondatabase/serverless`. Provider-portable
>   — switching Postgres hosts is a one-file driver swap in `lib/db/client.ts`.
> - **Neon region**: **Singapore (`ap-southeast-1`)** — chosen to match the Vercel
>   function region (not the developer's location); Neon has no Mumbai region.
> - **Schema workflow**: `pnpm db:push` (push-only) while the schema churns; switch to
>   `db:generate` + `db:migrate` (versioned SQL) for a shared/prod DB.
> - **Turbopack / Better Auth — two separate fixes, both required:**
>   1. `serverExternalPackages` (`better-auth`, `@better-auth/kysely-adapter`, `kysely`)
>      in `next.config.ts` so Node `require`s the CJS at runtime — otherwise the auth
>      route 500s.
>   2. A `pnpm.overrides` pin of `kysely` to `^0.28.17` in `package.json`. The bundled
>      `@better-auth/kysely-adapter@1.6.14` imports `DEFAULT_MIGRATION_TABLE` /
>      `DEFAULT_MIGRATION_LOCK_TABLE` from kysely's **main** entry, which **0.29 moved
>      out** (→ `kysely/migration`). pnpm auto-installs 0.29, so the production build's
>      externals-tracing fails until kysely is pinned back to 0.28. We use the Drizzle
>      adapter, not kysely — it's only an optional transitive peer.

## Auth model

- Multi-user with normal email + password (no team/multi-tenant).
- Every `ebay_account`, `product`, and `publication` is scoped by `user_id`.

## Auth implementation (✅ done)

- **Screens**: `/login` + `/register` under the `app/(auth)` route group — split-screen
  layout with a branded left panel (`features/auth/components/auth-left-panel.tsx`, placeholder
  content). Forms: `sign-in-form.tsx`, `sign-up-form.tsx`.
- **Forms**: react-hook-form + `standardSchemaResolver` (from `@hookform/resolvers/standard-schema`).
  Zod 4 implements Standard Schema, and `zodResolver` has a type clash with zod 4.4 + resolvers 5,
  so **use `standardSchemaResolver` for all forms**. Schemas live in `validations/auth.ts`.
- **Route protection**: `proxy.ts` at the repo root — Next 16 renamed `middleware` → `proxy`
  (runs on `nodejs`, not edge). Optimistic session-cookie check via Better Auth's
  `getSessionCookie`; no session → `/login?redirect=<path>`, session-on-auth-route → dashboard.
- **Post-auth redirect**: open-redirect-safe `?redirect=` handling in `lib/redirect.ts`
  (`getSafeRedirectPath`, `withRedirectParam`); falls back to `/dashboard`.
- **Not yet wired**: password reset, email verification, 2FA, OAuth (none enabled on the
  server). The gate is optimistic only — add a DAL `auth.api.getSession` check if hard
  per-route enforcement is ever needed.

## Account linking (✅ done)

- **Storage**: one `ebay_account` row per linked seller, scoped by `user_id`. The eBay
  **refresh token is encrypted at rest** (AES-256-GCM) via `lib/crypto/token-cipher.ts`,
  keyed by `EBAY_TOKEN_ENCRYPTION_KEY` (`openssl rand -hex 32`). The token column is
  nullable and is wiped on disconnect.
- **Connect flow**: `/ebay-accounts` → `GET /api/ebay/accounts/connect` mints a CSRF
  `state`, stores it in an httpOnly cookie, and redirects to eBay consent. eBay returns to
  `GET /api/ebay/accounts/callback`, which verifies the state, exchanges the code, reads the
  seller's username (Identity API, best-effort — seeds the default label), and stores the
  encrypted token against the session user. **The RuName "Auth accepted URL" must point at
  `/api/ebay/accounts/callback`.**
- **Management**: list / rename (`PATCH`) / disconnect (`DELETE`, soft — `deletedAt` set,
  token wiped) under `features/ebay-accounts/`. Disconnected accounts drop out of the list;
  reconnecting the same eBay username revives the existing row (clears `deletedAt`) instead of
  duplicating it. The list is a URL-driven data-table on TanStack
  Query (`GET /api/ebay/accounts`), the same pattern as products — see **Product CRUD**.
- **Scopes**: consent requests `EBAY_CONSENT_SCOPES` (sell.inventory + sell.account +
  commerce.identity.readonly); the refresh path keeps the narrower `EBAY_SCOPES`.
- **Replaced**: all POC scaffolding is gone — the `/api/ebay/auth/{login,callback}` routes, the
  global env-token publish endpoints (`/api/listings`, `/api/ebay/setup`), the `EBAY_REFRESH_TOKEN`
  env var, and the single-account `getAccessToken` cache. `lib/ebay/oauth.ts` keeps the
  `buildConsentUrl` / `exchangeCodeForTokens` / `refreshAccessToken(refreshToken)` primitives;
  manual publish (step 5, ✅ done) rebuilt publishing on per-account decrypted tokens — see
  **Manual publish** below.

## Product CRUD (✅ done)

The master listings, under `features/products/`. Create / list / edit / soft-delete, scoped by
`user_id`.

- **Soft delete**: a nullable `deleted_at` timestamp. Setting it drops the product out of every
  list/lookup (publications cascade on a _hard_ delete, so we never hard-delete from the UI). There
  is no UI to view deleted products — delete is one-way from the user's side.
- **Fixed fields**: every listing is **USD** and condition **new** — no pickers (`DEFAULT_CURRENCY`,
  `DEFAULT_CONDITION` in `validations/product.ts`). The columns stay in the schema for future
  flexibility; the service writes the fixed values.
- **Form**: react-hook-form + `standardSchemaResolver`. Two zod schemas bridged by mappers —
  `productFormSchema` (form shape: images as `{url}[]`, item specifics as `{name, values}[]` with
  comma-separated values) and `productInputSchema` (persistence shape: `string[]` / `Record`). The
  API validates `productInputSchema` independently of the form. Images are URL inputs only (no
  upload yet); item specifics (aspects) are a free-form name → comma-values editor, no eBay taxonomy.
- **List data layer** — mirrors the GPMS admin pattern: **TanStack Query** (`useProductsQuery` /
  `use-product-mutations`) over the `/api/products` route, with `hooks/use-table-params.ts` holding
  all table state (page / limit / sort / filters / search) **in the URL** (shareable, back-button
  works). React Query owns request cancellation and cache invalidation, so there's no hand-rolled
  AbortController and no `router.refresh()`. Service (`product-service.ts`) is the only DB-touching
  code; `product-client.ts` is the client-side HTTP layer. The same data-table + paginated-API
  pattern now backs the eBay-accounts list too, so every list page in the app behaves identically.
- **Re-added**: `@tanstack/react-query` (removed during account-linking when it had no consumer; the
  product list is its first real use). Provider in `providers/query-provider.tsx`, keys in
  `lib/query-keys.ts`.

## Manual publish (✅ done)

Publish a master product to one or more linked accounts, under `features/publications/`. Each publish
is recorded as a `publication` row, scoped by `user_id`.

- **Per-account tokens**: the encrypted refresh token is decrypted and exchanged for a short-lived
  access token per publish (`getAccountAccessToken` in `ebay-account-service.ts` — the only code that
  reads the token). The global env-token POC publish path is gone; publishing is rebuilt on the
  Inventory API under `lib/ebay/{client,account-setup,listing}.ts`, where `ebayRequest` now takes an
  explicit access token instead of a global cache.
- **Publish flow**: a "Publish" row action on the products table opens a dialog with a checklist of
  active accounts → `POST /api/publications`. The service (`publication-service.ts`) snapshots the
  product onto a `publication` row (status `publishing`), then per account runs the 3-call sequence
  (`PUT inventory_item` → `POST offer` → `POST offer/{id}/publish`) and flips the row to `published`
  (with `ebay_offer_id` / `ebay_listing_id` / `published_at`) or `failed` (+ `error_message`).
  Accounts are processed sequentially and independently — one failure doesn't abort the rest.
- **Snapshot only (for now)**: the publication copies the product verbatim; `overridden_fields` stays
  empty. Per-publish field editing comes later.
- **Business policies / category auto-resolved**: on first publish per account, `resolveSellerSetup`
  fetch-or-creates the payment/return/fulfillment policies + inventory location and caches their IDs
  onto the `ebay_account` row (reused on later publishes). Category is `product.category_id`, falling
  back to `DEFAULT_CATEGORY_ID` (Fashion Jewelry > Rings) when unset. Listings are always **NEW / USD**.
- **List**: `/publications` is the same URL-driven data-table on TanStack Query as products/accounts
  (`usePublicationsQuery` over `GET /api/publications`), with a status filter and "View on eBay" links.
- **Trigger-agnostic**: `publishListing()` is pure (no DB); `publishProductToAccounts` only
  orchestrates + persists, so step 6's queue/cron is a swap of the caller, not the publish logic.

## Deferred: scheduling & multi-account fan-out

Publishing one product to many accounts (and scheduled publishes) must respect eBay
rate limits, so the fan-out runs through a job/queue rather than firing all calls at
once. This is **deferred** — we build products, accounts, and manual publish first.

Candidates to revisit when we get there:

- **Inngest** — durable functions with cron scheduling, retries, built-in
  concurrency/throttling. Best fit for rate-limited fan-out; generous free tier.
- **Upstash QStash** — lightweight HTTP queue + scheduled messages. Cheap, simpler.
- **Vercel Cron + DB polling** — no extra service, but Hobby plan caps cron at ~once/day
  and retries/throttling are hand-built.

## Build order (jobs deferred)

1. ✅ DB + Drizzle schema (Better Auth tables + ebay_account, product, publication) — pushed to Neon
2. ✅ Better Auth (email + password) — server/client/route wired and verified; sign-in/sign-up UI, split-screen `(auth)` layout, and route protection (`proxy.ts` gate + safe post-login redirect) all done. See **Auth implementation** above.
3. ✅ Account linking — per-account encrypted token storage, real consent flow, and
   connect/rename/disconnect management. See **Account linking** above.
4. ✅ Product CRUD — create / list / edit / soft-delete master listings, URL-driven data-table on
   TanStack Query. See **Product CRUD** above.
5. ✅ Manual publish — product → one or more selected accounts, on per-account decrypted tokens,
   recorded as `publication` rows. See **Manual publish** above.
6. _Later:_ scheduling + rate-limited fan-out

## Scaling path

Mental model: scale the stateless web layer for free (Vercel), protect the DB with
pooling/replicas, and push all slow eBay work into async workers. The real ceiling is
eBay's API quota, not our servers. What breaks first and what replaces it:

1. **Fan-out path (breaks first → fix first).** One product → N accounts → ~3 eBay
   calls each. A synchronous loop inside a request won't survive volume (timeouts, no
   retries, no throttling).
   - Replace inline publishing with a **durable queue + worker** (per-account
     concurrency, retries, backoff). Start managed (Inngest / QStash); move to
     self-managed SQS + workers only at large scale.
   - Build it (step 5) trigger-agnostic: keep `publishListing()` pure and drive it off the
     `publication.status` state machine — so cron → queue is a zero-logic swap.

2. **eBay rate limit (external ceiling money can't instantly fix).** eBay caps calls
   per app per day, shared across all users, plus per-account.
   - Apply for higher limits via eBay's **Application Growth Check** (has lead time —
     start early), adopt **bulk endpoints** (`bulkCreateOffer`/`bulkPublishOffer`,
     25/call), and **cache taxonomy/category aspects**.

3. **Database (Neon) — scales gracefully, in cheap steps.** `publication` is the
   high-growth table (a row per product × account × publish).
   - Add **connection pooling** (Neon's built-in PgBouncer — essential with serverless)
     → bump compute tier → **read replicas** for dashboards → eventually
     **partition/archive** old `publication` rows. No rewrite.

4. **Web layer (Vercel) — effectively free.** Stateless functions auto-scale; cost
   rises with traffic but it's not an architecture problem. Long/expensive endpoints
   should be queue jobs (see #1) anyway.
