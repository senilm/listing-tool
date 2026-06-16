# eBay Accounts (Connect) Module Walkthrough

> Plain-English walkthrough of how an eBay seller account gets connected and
> managed, file by file, then an end-to-end connect flow trace. Covers
> `features/ebay-accounts/**` (minus the two service functions documented in
> `publications-module.md`), the `ebay_account` schema/enum/validation, and the
> connect/callback API routes. Every acronym is spelled out the first time it
> appears.

This is the flow that _creates_ an account row — where `buildConsentUrl` and the
`state` token from `lib/ebay/oauth.ts` (see `ebay-module.md`) actually get used.
The publish flow _consumes_ the stored token; this flow is how it gets there.

---

## The data shape

### `lib/enums/ebay-account.ts` — account status

Two states (single source of truth for the Postgres enum + the UI badge):

- **Active** — connected, has a valid token, can publish.
- **NeedsReconsent** — token went bad / scopes changed; the seller must
  re-approve. The status exists in the model; the auto-transition to it isn't
  wired yet — it's the hook for when a token refresh fails.

### `lib/db/schema/ebay-account.ts` — the table

One row = one linked seller account.

- `refreshToken` — nullable text, stored **encrypted** (the schema comment is
  explicit: encryption happens in the _service_ layer, not here). Nulled on
  disconnect.
- `refreshTokenExpiresAt`, `scopes` (what was granted), `status`.
- `ebayUsername` — nullable (identity is best-effort, so an account can exist
  without one).
- The four cached setup IDs live here: `paymentPolicyId`, `returnPolicyId`,
  `fulfillmentPolicyId`, `merchantLocationKey` — the cache `ensureSellerSetup`
  writes to.
- `deletedAt` — **soft delete** (mark deleted, don't remove the row) so a
  disconnected account can be revived on reconnect.
- Indexed on `userId` (the column every query filters by).

### `validations/ebay-account.ts`

Just the rename schema: a label, trimmed, 1–60 chars. Connecting takes no body —
it's a redirect, not a form.

---

## The two routes that matter

### `app/api/ebay/accounts/connect/route.ts` — "Step 0: send the seller to eBay"

A `GET` (it's a plain link the browser follows, not a fetch):

1. Checks the user is signed in — else redirect to login.
2. Generates `state` = 32 random bytes hex (the anti-**CSRF** — Cross-Site
   Request Forgery — token).
3. Redirects the browser to `buildConsentUrl(state)` (eBay's consent screen).
4. Stores the same `state` in an **httpOnly cookie** (`maxAge: 600` = 10 min,
   `sameSite: lax`, `secure` in production).

Why the cookie: the other half of the CSRF defense. We send `state` to eBay
_and_ stash it in a cookie only our server can read (`httpOnly` = not readable by
JavaScript). When eBay sends `state` back, we compare the two. An attacker
forging a callback can't know the cookie value, so they can't match it. The
10-minute expiry limits the window.

### `app/api/ebay/accounts/callback/route.ts` — "Step 4: eBay sends the seller back"

This is the **RuName accept URL** — eBay must be configured to redirect here
after consent.

1. Signed-in check (else redirect to login).
2. Read `code` + `state` from the URL, read `expectedState` from the cookie.
3. **Security gate:** if any of `code`/`state`/`expectedState` is missing, or
   `state !== expectedState`, bail → redirect back with `?error=consent_failed`.
   This is where the CSRF check fires.
4. `exchangeCodeForTokens(code)` — trade the code for tokens. No refresh token →
   `?error=no_refresh_token`.
5. `fetchEbayUsername(access_token)` — best-effort username.
6. `linkEbayAccount(...)` — persist: userId, username, refresh token (encrypted
   inside the service), expiry from `refresh_token_expires_in`, granted scopes.
   Revives a soft-deleted row if the same username reconnects, else inserts.
7. Redirect back with `?connected=1`.
8. **Every path calls `withClearedState`** — deletes the state cookie. One-time
   use: consumed whether we succeed or fail, so it can't be replayed.

These two routes **don't use `withApi`** — they're browser redirects, not JSON
APIs, so they handle their own session check and return redirects, not JSON.

### Supporting routes

- `accounts/route.ts` (`GET`) — lists accounts (`withApi`, shared parsers, scoped
  to user). Same shape as the publications list.
- `accounts/[id]/route.ts` — `DELETE` (soft-disconnect) and `PATCH` (rename),
  both `withApi`, both 404 if the account isn't the user's. Call the service
  functions covered in `publications-module.md`.

---

## Client + hooks

- `services/ebay-account-client.ts` — `fetchEbayAccounts`,
  `renameEbayAccountRequest` (PATCH), `disconnectEbayAccountRequest` (DELETE).
  Types-only import from the service, so no server code leaks into the bundle.
- `hooks/use-ebay-accounts-query.ts` — list query; `keepPreviousData` (no
  flicker).
- `hooks/use-ebay-account-mutations.ts` — `useRenameEbayAccount` +
  `useDisconnectEbayAccount`; both invalidate the accounts cache on success so
  the table refreshes. No connect mutation — connect is a navigation, not a
  mutation.

---

## The UI

- `components/ebay-accounts-table.tsx` — the list page. The **"Connect account"
  button is just a `<Link>` to the connect API route** — clicking it navigates
  the browser to the connect route, starting the redirect dance. Holds the
  rename/disconnect dialog state, opened from row actions.
- `components/ebay-connect-feedback.tsx` — the other end of the redirect. Reads
  `?connected` / `?error` on the accounts page, fires the matching toast, then
  `router.replace`s to strip the query params so a refresh doesn't re-fire the
  toast. Turns the callback's redirect params into user-visible feedback.
- `components/ebay-account-columns.tsx` — Label, eBay username, Status badge,
  Connected date, + Rename/Disconnect row actions.
- `components/ebay-account-details.tsx` — detail-page card (status, username,
  connected date). The account's publish history (`AccountPublicationsTable`)
  sits alongside it.
- `components/disconnect-ebay-account-dialog.tsx` — confirm dialog; its copy
  tells the user reconnecting later is possible (matches revive-on-reconnect).
- `components/rename-ebay-account-dialog.tsx` — react-hook-form + the rename
  schema; PATCHes the label.
- `components/ebay-account-status-badge.tsx` — Active = green, Needs reconsent =
  amber.
- `config/ebay-account-filters.ts` — the Status multi-select filter.

---

## End-to-End Flow Trace: "Connect an eBay account"

```
USER clicks "Connect account"  (just a <Link> to the connect route)
  └─ GET /api/ebay/accounts/connect
       ├─ check session (else → /login)
       ├─ state = randomBytes(32)
       ├─ Set-Cookie: ebay_oauth_state = state  (httpOnly, 10 min)
       └─ 302 redirect → buildConsentUrl(state)   [auth.ebay.com consent screen]

USER logs into eBay + approves the scopes  (prompt:login forces account choice)
  └─ eBay 302 redirects → RuName accept URL = GET /api/ebay/accounts/callback?code=…&state=…
       ├─ check session (else → /login)
       ├─ read code + state (URL) and expectedState (cookie)
       ├─ CSRF gate: missing or state !== expectedState → redirect ?error=consent_failed
       ├─ exchangeCodeForTokens(code)        → access token + refresh token
       │     └─ no refresh token → ?error=no_refresh_token
       ├─ fetchEbayUsername(access token)    → best-effort label (may be null)
       ├─ linkEbayAccount(...)               → encrypt refresh token, INSERT or revive row
       ├─ clear state cookie  (every path)
       └─ 302 redirect → /ebay-accounts?connected=1   (or ?error=link_failed on throw)

BROWSER lands on /ebay-accounts
  └─ EbayConnectFeedback reads ?connected / ?error
       ├─ toast "eBay account connected"  (or error message)
       └─ router.replace → strips query params (so refresh won't re-toast)
  └─ accounts table shows the new row (Active)
```

The connect path dovetails with publishing: the encrypted refresh token stored
here is exactly what `getAccountAccessToken` decrypts later to publish (see
`publications-module.md`).
