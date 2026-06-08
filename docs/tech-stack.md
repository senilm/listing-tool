# Listing Tool — Tech Stack & Architecture Decisions

Decisions for the jewellery multi-account eBay listing tool. See `docs/schema.md` for
the data model.

## Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript | Already set up; route handlers serve as the backend. |
| **Hosting** | Vercel | Zero-config Next.js deploys, preview environments. |
| **Database** | Neon (serverless Postgres) | Free tier, Vercel-native, scales to zero. Schema is relational with multi-way queries, so Postgres over DynamoDB. |
| **ORM** | Drizzle | SQL-first, strong TS inference, serverless-friendly, pairs with Neon's HTTP driver and Better Auth. |
| **Auth** | Better Auth | Email + password, sessions in Postgres. Full control, minimal lock-in. |
| **Validation** | Zod | Shared schemas across API input and forms. |
| **Frontend data** | TanStack Query | Server-state fetching over route handlers. |
| **UI** | shadcn/ui + Tailwind v4 | Already installed. |

> **Implementation notes**
> - **DB driver**: `drizzle-orm/neon-http` + `@neondatabase/serverless`. Provider-portable
>   — switching Postgres hosts is a one-file driver swap in `lib/db/client.ts`.
> - **Neon region**: **Singapore (`ap-southeast-1`)** — chosen to match the Vercel
>   function region (not the developer's location); Neon has no Mumbai region.
> - **Schema workflow**: `pnpm db:push` (push-only) while the schema churns; switch to
>   `db:generate` + `db:migrate` (versioned SQL) for a shared/prod DB.
> - **Turbopack**: Better Auth's CJS deps require `serverExternalPackages`
>   (`better-auth`, `@better-auth/kysely-adapter`, `kysely`) in `next.config.ts` to load
>   under Next 16's default bundler, otherwise the auth route 500s.

## Auth model

- Multi-user with normal email + password (no team/multi-tenant).
- Every `ebay_account`, `product`, and `publication` is scoped by `user_id`.

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
2. 🚧 Better Auth (email + password) — server/client/route wired and verified end-to-end; sign-up/sign-in UI still pending
3. Account linking — move the POC OAuth flow into per-account encrypted token storage
4. Product CRUD (the master listings)
5. Manual publish — single account, then to selected accounts
6. *Later:* scheduling + rate-limited fan-out

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
   - Bake in now (free): keep `publishListing()` pure and trigger-agnostic, and drive
     it off the `publication.status` state machine — so cron → queue is a zero-logic
     swap.

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
