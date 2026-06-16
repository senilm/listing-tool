# eBay Account Linking — How It Works

A walkthrough of the per-account eBay linking feature, mapped to the files that
implement each step. See `docs/tech-stack.md` for the higher-level decisions.

The feature has four small flows: the **guard** (reaching the page), the **read**
(listing accounts), the **connect** (OAuth handshake), and the **writes**
(rename / disconnect).

---

## 0. The guard — reaching the page

Every authenticated page lives under the `(app)` route group, and the layout wraps
the shell in a single guard.

```
proxy.ts                     → optimistic session-cookie check at the edge (no DB)
   ↓ cookie present
app/(app)/layout.tsx         → <AuthGuard> … </AuthGuard>
   ↓
components/auth-guard.tsx     → await requireSession() → redirect to /login if none
   ↓ session valid
   renders the page
```

- `proxy.ts` is the cheap first gate (cookie exists?).
- `AuthGuard` is the authoritative gate (verifies the session server-side).
- `lib/auth/session.ts` holds `requireSession()`, wrapped in React `cache()` so it
  hits Better Auth **once per request** no matter how many callers ask.

---

## 1. Viewing linked accounts (read path)

A URL-driven `DataTable` on TanStack Query — the same pattern as products (see
`docs/tech-stack.md`). The page is a thin server component; the table fetches client-side.

```
app/(app)/ebay-accounts/page.tsx              (server component — no data fetch)
   │  <Suspense><EbayAccountsTable/></Suspense>   + invisible <EbayConnectFeedback/>
   ↓
features/ebay-accounts/components/ebay-accounts-table.tsx   (client)
   │  useTableParams({ filterKeys:["status"] })  → URL holds page/limit/sort/filter/search
   │  useEbayAccountsQuery(apiParams)            → React Query
   ↓
features/ebay-accounts/services/ebay-account-client.ts
   fetchEbayAccounts(params) → GET /api/ebay/accounts?…
   ↓
app/api/ebay/accounts/route.ts (GET)
        • getSession → 401 if none
        • listEbayAccounts({ userId, page, limit, q, statuses, sort })
              SELECT … WHERE userId = …          (never selects the token column)
   ↓ { items: EbayAccountSummary[], total }
   ↓
   DataTable renders rows (label / <EbayAccountStatusBadge> / connected date)
   + a ⋯ row-actions column (Rename / Disconnect). The toolbar holds "Connect account".
```

### Why a data-table here too?

Originally this was a card grid — accounts were a tiny set and cards were more glanceable.
We moved it onto the same data-table + paginated API as products for **consistency** (one
list pattern across the app) and because a seller can accumulate many accounts over time;
status filter + search + sorting earn their keep, and React Query gives free caching and
cache invalidation on rename/disconnect.

---

## 2. Connecting an account (OAuth handshake)

Three actors: the app, eBay, the DB.

```
[Click "Connect eBay account"]
   ebay-accounts-table.tsx (toolbar) → native <a href={ebayAccountConnectApiRoute()}>
   (a full-page navigation on purpose, NOT next/link: a client-side Link would
    RSC-fetch/prefetch this redirect route and fail CORS on the cross-origin 302)
   ↓ browser GET
app/api/ebay/accounts/connect/route.ts
   • requireSession (else → /login)
   • random CSRF `state` → stored in an httpOnly cookie
   • 302 → eBay consent URL            (buildConsentUrl, lib/ebay/oauth.ts)
   ↓
[eBay consent screen — user approves]
   ↓ eBay 302s back to the RuName accept URL →
app/api/ebay/accounts/callback/route.ts
   • verify ?state === cookie           (CSRF check)
   • exchangeCodeForTokens(code)        (lib/ebay/oauth.ts)
   • fetchEbayIdentity(accessToken)     (lib/ebay/identity.ts, apiz host, best-effort)
        - reads the immutable userId (dedup key) + username (default label)
   • linkEbayAccount({ … })             (service):
        - encryptToken(refreshToken)    (lib/crypto/token-cipher.ts, AES-256-GCM)
        - revive row by (userId, ebayUserId), else insert
   • 302 → /ebay-accounts?connected=1   (or ?error=…)
   ↓
app/(app)/ebay-accounts/page.tsx  re-renders with the fresh list
   └─ ebay-connect-feedback.tsx (client) reads ?connected / ?error
        → toast → strips the query param
```

The refresh token never leaves the server unencrypted, and the page never receives
it at all — only metadata.

> **Config note:** the eBay RuName's "Auth accepted URL" must point at
> `/api/ebay/accounts/callback`, and `EBAY_TOKEN_ENCRYPTION_KEY` must be set.

---

## 3. Managing an account (rename / disconnect — write path)

The table's ⋯ row-actions open dialogs; the dialogs call React Query mutations, which
hit the API routes and invalidate the accounts cache on success (no `router.refresh()`).

```
ebay-account-columns.tsx  (⋯ row actions, in the table)
   ├─ "Rename"     → rename-ebay-account-dialog.tsx
   │       form (zod + standardSchemaResolver)
   │       useRenameEbayAccount()  → PATCH /api/ebay/accounts/[id]
   │           • getSession → 401 if none
   │           • validate body → renameEbayAccount({ id, userId, label })
   │       onSuccess → invalidate QUERY_KEYS.ebayAccountsRoot  (table refetches)
   │
   └─ "Disconnect" → disconnect-ebay-account-dialog.tsx  (wraps <ConfirmDialog>)
           useDisconnectEbayAccount()  → DELETE /api/ebay/accounts/[id]
               • getSession → 401 if none
               • disconnectEbayAccount({ id, userId })  ← soft: deletedAt set, token=null
           onSuccess → invalidate QUERY_KEYS.ebayAccountsRoot
```

---

## Layers

| Layer                  | Files                                                                             | Job                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Pages / components** | `app/(app)/ebay-accounts/`, `features/ebay-accounts/components/`                  | Render UI, trigger actions                                                              |
| **Data hooks**         | `features/ebay-accounts/hooks/`                                                   | React Query read (`use-ebay-accounts-query`) + mutations (`use-ebay-account-mutations`) |
| **Client HTTP**        | `features/ebay-accounts/services/ebay-account-client.ts`                          | `fetch` wrappers the hooks call                                                         |
| **API routes**         | `app/api/ebay/accounts/{route,connect,callback,[id]}`                             | HTTP edges — auth check + call the service                                              |
| **Service (DAL)**      | `features/ebay-accounts/services/ebay-account-service.ts`                         | All DB access; the only code that touches the token                                     |
| **Helpers**            | `lib/ebay/{oauth,identity,config}`, `lib/crypto/token-cipher`, `lib/auth/session` | Pure building blocks                                                                    |

**Auth:** every `/api/ebay/accounts/*` handler sits _outside_ the `(app)` layout guard,
so each re-checks the session itself (`getSession`) and returns **401 JSON** rather than
redirecting. The list `GET` is no exception — reads and writes both authenticate at the
route.

**Route builders:** page/navigation paths live in `lib/routes.ts`; API endpoint
paths live in `lib/api-routes.ts`. Keep the two separate.
