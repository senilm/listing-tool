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

A server component — fetches on the server, no client loading state.

```
app/(app)/ebay-accounts/page.tsx              (server component)
   │  const accounts = await listEbayAccounts()
   ↓
features/ebay-accounts/services/ebay-account-service.ts
   listEbayAccounts()
        • requireSession() → user.id          (self-scopes; no userId argument)
        • SELECT … WHERE userId = …            (never selects the token column)
   ↓ EbayAccountSummary[]
   ↓
features/ebay-accounts/components/ebay-accounts-list.tsx
        • empty? → <EbayAccountsEmpty>
        • else   → map → <EbayAccountCard> per account
                          ├─ <EbayAccountStatusBadge>   (active / disabled)
                          └─ <EbayAccountActions>        (⋯ menu, client)
```

The page header also renders `<ConnectEbayAccountButton>` and an invisible
`<EbayConnectFeedback>` (see flow 2).

### Why cards, not a data-table?

Linked accounts are a **tiny, heterogeneous** set (realistically 1–12 per user). The
`DataTable` (sorting, filters, column customizer, pagination) and a paginated API
exist to make **large, homogeneous** datasets scannable — that cost buys nothing at
N≈3, and a card grid is more glanceable. The data-table + pagination belong on
**products** and especially **publications** (a row per product × account × publish —
the high-growth table). Match the UI to the data shape.

---

## 2. Connecting an account (OAuth handshake)

Three actors: the app, eBay, the DB.

```
[Click "Connect eBay account"]
   connect-ebay-account-button.tsx → <Link href={ebayAccountConnectApiRoute()}>
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
   • fetchEbayUsername(accessToken)     (lib/ebay/identity.ts, best-effort)
   • linkEbayAccount({ … })             (service):
        - encryptToken(refreshToken)    (lib/crypto/token-cipher.ts, AES-256-GCM)
        - upsert row by (userId, username)
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

Triggered from client components, but mutations go through API routes that re-check
auth (they sit **outside** the `(app)` layout guard).

```
ebay-account-actions.tsx  (⋯ dropdown, client)
   ├─ "Rename"     → rename-ebay-account-dialog.tsx
   │       form (zod + standardSchemaResolver)
   │       PATCH ebayAccountApiRoute(id)
   │           → app/api/ebay/accounts/[id]/route.ts  (PATCH)
   │               • getSession → 401 if none
   │               • validate body
   │               • renameEbayAccount({ id, userId, label })
   │           → router.refresh()  (re-runs flow 1)
   │
   └─ "Disconnect" → disconnect-ebay-account-dialog.tsx
           wraps shared <ConfirmDialog>
           DELETE ebayAccountApiRoute(id)
               → app/api/ebay/accounts/[id]/route.ts  (DELETE)
                   • getSession → 401 if none
                   • disableEbayAccount({ id, userId })  ← soft: status=Disabled, token=null
               → router.refresh()
```

---

## Layers

| Layer | Files | Job |
|---|---|---|
| **Pages / components** | `app/(app)/ebay-accounts/`, `features/ebay-accounts/components/` | Render UI, trigger actions |
| **API routes** | `app/api/ebay/accounts/{connect,callback,[id]}` | HTTP edges — auth check + call the service |
| **Service (DAL)** | `features/ebay-accounts/services/ebay-account-service.ts` | All DB access; the only code that touches the token |
| **Helpers** | `lib/ebay/{oauth,identity,config}`, `lib/crypto/token-cipher`, `lib/auth/session` | Pure building blocks |

**The rule behind the read/write split:** reads happen *inside* the `(app)` layout
(the guard already ran, so the service self-scopes via `requireSession`); writes
happen in `/api/*` routes *outside* the layout, so each one re-checks the session
itself and returns **401 JSON** rather than redirecting.

**Route builders:** page/navigation paths live in `lib/routes.ts`; API endpoint
paths live in `lib/api-routes.ts`. Keep the two separate.
