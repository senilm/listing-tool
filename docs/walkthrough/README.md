# Codebase Walkthrough

Plain-English, file-by-file walkthroughs of the listing tool's core, written to
build full confidence before shipping. Every eBay API call is justified; every
acronym is spelled out in-place the first time it appears.

## The big picture

"eBay" is really **two flows**, and together they are the entire meaningful core
of the app:

1. **Connecting an account** (OAuth) — `lib/ebay/**`, `features/ebay-accounts/`,
   `lib/crypto/`. How a seller authorizes us to list on their behalf.
2. **Publishing a listing** — `lib/ebay/listing.ts`, `features/publications/`.
   The "publications" module is the listing flow.

Products is plain DB CRUD; auth (Better Auth) and search are done.

## Docs

- [`ebay-module.md`](./ebay-module.md) — the eBay integration: config, endpoints,
  request client, token encryption, OAuth, identity, account setup, and the
  3-call publish sequence — with the doc reason for every call.
- [`ebay-accounts-connect-module.md`](./ebay-accounts-connect-module.md) — how a
  seller account gets connected: the `ebay_account` schema, the connect/callback
  OAuth routes (where `state` + the consent URL are used), management routes,
  hooks, and UI, plus the end-to-end "connect an eBay account" flow trace.
- [`publications-module.md`](./publications-module.md) — the publications
  feature: schema/enum/validation, the publish-orchestration service, API route,
  hooks, and UI, plus the end-to-end "publish a product to N accounts" flow trace.
