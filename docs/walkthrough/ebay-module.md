# eBay Module Walkthrough

> Plain-English walkthrough of the eBay integration, file by file, with the
> reason behind every eBay API call. Covers `lib/ebay/**` and `lib/crypto/**`.
> Every acronym is spelled out the first time it appears.

"eBay" in this codebase is really **two flows**:

1. **Connecting an account** (OAuth) — `lib/ebay/` + `features/ebay-accounts/` + `lib/crypto/`. How a seller authorises us to list on their behalf.
2. **Publishing a listing** — `lib/ebay/listing.ts` + `features/publications/`. The "publications" module is the listing flow.

This doc covers the shared `lib/ebay/**` plumbing and calls. The feature layers are documented separately.

---

## Part 1 — The Plumbing (no eBay calls yet)

### `lib/ebay/config.ts` — "Which eBay are we talking to?"

eBay has two separate worlds: **sandbox** (fake, for testing) and **production** (real). Different URLs.

- `ENV` reads `EBAY_ENV`, defaults to `sandbox` so you never hit production by accident.
- `HOSTS` — eBay uses **three different domains**:
  - `api` (`api.ebay.com`) → REST calls (create listing, etc.)
  - `auth` (`auth.ebay.com`) → where the _seller_ logs in to approve us
  - `web` (`www.ebay.com`) → normal storefront (e.g. link to a live listing)
- `ebayConfig` bundles the environment's URLs + app credentials (`clientId`, `clientSecret`, `ruName`). **`ruName`** = "Redirect URL Name", a nickname eBay assigns to your registered return URL (used in OAuth).
- **`identityBase`** is a separate host: the Commerce Identity API lives on `apiz.(sandbox.)ebay.com` (note the `z`), **not** the `api` host the Sell APIs use. Calling identity on the wrong host silently fails.
- **Scopes** = permissions we ask the seller for. Two sets, on purpose:
  - `EBAY_SCOPES`: `sell.inventory` + `sell.account` — needed long-term to manage listings; used on the refresh path.
  - `EBAY_CONSENT_SCOPES`: the above **+ `commerce.identity.readonly`** — added only at consent time so the access token can read the seller's immutable user ID once after linking. The refresh path keeps the narrower set (less standing access = safer).
- **Gotcha:** scope strings always literally say `api.ebay.com`, even in sandbox. They are identifiers, not URLs — don't "fix" them to sandbox or auth breaks.

### `lib/ebay/api-routes.ts` — "The list of eBay endpoints we use"

A phonebook of every eBay REST path, as functions returning the path (no domain — caller adds the base). Nothing is called here; it keeps paths in one place. Reading the names top to bottom previews the publish flow: inventory item → offer → publish; plus location and business-policy endpoints; plus identity and oauth.

### `lib/ebay/client.ts` — "One front door for every eBay call"

`ebayRequest()` is the single function everything uses to talk to eBay.

- **`accessToken` is a parameter, not global** — multi-account design: each account has its own token, passed in per call. No shared "logged in" state. This is what makes multiple seller accounts work.
- **Headers:** `Bearer` token; `Content-Language`/`Accept-Language: en-US` (eBay Sell API _requires_ a language header). `EBAY_MARKETPLACE_ID = "EBAY_US"` hard-codes US eBay.
- **Retry loop:** sandbox randomly throws 500s (errorId 25001). On 5xx → wait `attempt × 500ms`, retry up to 4×. On 4xx (bad data, your fault) → fail immediately, no retry.

### `lib/crypto/token-cipher.ts` — "Lock the seller's token in a safe"

Linking gives us a long-lived **refresh token**. If the DB leaked, those are gold to an attacker, so we never store them in plain text.

- **AES-256-GCM** — the encryption standard used. AES-256 is the cipher; GCM is an _authenticated_ mode, meaning it also detects tampering, not just scrambles.
- `getKey()` reads a 32-byte secret from `EBAY_TOKEN_ENCRYPTION_KEY`, **lazily** (only when encrypting/decrypting) so the app doesn't crash on boot if it's missing. Validates length.
- `encryptToken` outputs one self-contained string `iv:authTag:ciphertext` (the **IV** = initialization vector, random per encryption; the **auth tag** proves the ciphertext wasn't tampered with; the ciphertext is the scrambled bytes) — the DB column holds everything needed to decrypt. A fresh random IV each call means the same token encrypts differently every time.
- `decryptToken` reverses it and **throws if the authTag doesn't match** (tampering / wrong key).

---

## Part 2 — The Real Calls

The pattern across the app: **store the long-lived refresh token (encrypted), mint a short-lived access token right before each operation.**

### `lib/ebay/oauth.ts` — "Get the seller's permission, keep the keys"

Standard **OAuth 2.0 Authorization Code grant**. We never see the seller's password; eBay logs them in, asks for approval, and hands us keys.

Helpers:

- `tokenEndpoint()` — the one URL to trade things for tokens.
- `basicAuthHeader()` — eBay's token endpoint requires the **app's** identity as HTTP Basic (`clientId:clientSecret`, base64). Mandated on every token call.
- `postToken()` — token requests are `POST` with `application/x-www-form-urlencoded` (OAuth spec) + the Basic header.

Three steps:

- **`buildConsentUrl(state)` (Step 1)** — URL we send the seller to (on `auth.ebay.com`):
  - `client_id` — which app is asking.
  - `redirect_uri: ruName` — eBay quirk: this is the **RuName nickname**, not a literal URL.
  - `response_type: "code"` — auth-code grant.
  - `scope` — `EBAY_SCOPES` (what the consent screen shows).
  - `state` — anti-CSRF token; eBay echoes it back, we verify it matches.
  - `prompt: "login"` — forces the login screen instead of silently reusing a session. **Critical for multi-account:** lets the user pick _which_ seller account to connect.
- **`exchangeCodeForTokens(code)` (Step 3)** — after approval eBay redirects with a short-lived `code`. POST it with `grant_type: "authorization_code"` + matching `redirect_uri` (eBay requires it to match exactly). Returns **access token** (~2h) + **refresh token** (~18mo). We encrypt and store the refresh token.
- **`refreshAccessToken(refreshToken)`** — mint a fresh access token with `grant_type: "refresh_token"`, using the **narrower `EBAY_SCOPES`** (no identity needed on refresh).

### `lib/ebay/identity.ts` — "Which account is this?"

One call: `GET /commerce/identity/v1/user/` **on the `identityBase` (`apiz`) host**. Right after linking, uses the fresh (identity-scoped) access token to read the account's identity.

- We read **`userId`** — eBay's **immutable, per-account identifier**. This is our dedup key: it never changes (unlike the username, which users can edit) and is unique per seller account, so it answers "have I linked this exact account before?". `username` is read too, only as a friendly default label when eBay still provides it.
- **Why not username as the key:** users can change it, and as of **Sept 2025** eBay stopped returning `username` for U.S. accounts (it returns the `userId` value in that field instead). Since the app is `EBAY_US`-only, username is unreliable — `userId` is the durable identifier.
- **Best-effort:** wrapped in try/catch, returns `null` on any failure (including the historic sandbox getUser outage). When null, the account links without a dedup key and just can't be auto-revived on reconnect — see `ebay-accounts-connect-module.md`.
- **Host gotcha:** this is the one call that must hit `apiz`, not `api`. Calling it on the Sell API host fails silently (and was a real bug we hit).

### `lib/ebay/account-setup.ts` — "Make the account able to sell"

eBay won't let you publish via the Inventory API unless the account has **business policies** and a **warehouse location**. A fresh/sandbox account has none. `resolveSellerSetup()` ensures they exist and returns the four IDs an offer needs.

- **`ensureOptedIn` → `POST /sell/account/v1/program/opt_in`** (`SELLING_POLICY_MANAGEMENT`). eBay requires opt-in before the policy endpoints work. `.catch()` swallows the "already opted in" error.
- The next three use a **"find one, else create one"** pattern — reuse a real seller's existing policies; only create a default for fresh accounts; never spam duplicates:
  - **`resolvePaymentPolicy`** — `GET`, else `POST`. How the seller gets paid.
  - **`resolveReturnPolicy`** — `GET`, else `POST`. Default: returns accepted, 30-day, buyer pays return shipping.
  - **`resolveFulfillmentPolicy`** — `GET`, else `POST`. Shipping. Default: 1-day handling, domestic flat-rate USPS Priority, free shipping.
- **`resolveLocation`** — listings need a merchant location (ship-from address):
  - Tries `GET /location?limit=1` to reuse; flaky in sandbox (25001), so falls through on failure.
  - Fallback `POST /location/{key}` with a hard-coded address and key `warehouse-1`. **Keyed + idempotent** — we pick the key, safe to call twice.
  - Catches **errorId 25803** ("location already exists for this key") as success; other errors throw. `createInventoryLocation` returns `204` (no body) — we already know the key.
- The caller **caches the four IDs onto the `ebay_account` row** → runs once per account, not per listing.

### `lib/ebay/listing.ts` — "Put the product live" (the 3-call publish)

`publishListing()` is the canonical eBay Inventory API publish sequence. Pure — no DB, no auth logic. Takes a token, the setup IDs, and listing data; returns the live listing info.

**`buildEbaySku()`** generates an internal SKU (Stock Keeping Unit — a unique code identifying an inventory item on an account) encoding three rules:

- `slug` (title, readable) + `account` fragment + base-36 `timestamp`.
- **Account fragment** so the same product never shares a SKU across accounts → eBay can't correlate two accounts as one item (no-cross-account-linkage rule).
- **Timestamp** because SKUs are single-use; a retry after failure needs a new SKU to avoid colliding with a stranded offer.
- Capped at 50 chars (eBay limit). Users never see SKUs (mirrors eBay's own UI).

**The 3 calls:**

1. **`PUT /sell/inventory/v1/inventory_item/{sku}`** — "here is the product": quantity, `condition: NEW`, title, description, **aspects** (structured item specifics), image URLs. PUT = create-or-replace, keyed by SKU (idempotent). Inventory API separates _what the product is_ (item) from _how you sell it_ (offer).
2. **`POST /sell/inventory/v1/offer`** — "how I'm selling it": `marketplaceId`, `format: FIXED_PRICE`, quantity, `categoryId` (default `67681` = Fashion Jewelry > Rings), `listingPolicies` (**the three IDs from account-setup — offer won't validate without them**), price in USD, `merchantLocationKey`, `listingDuration: GTC` (**G**ood '**T**il **C**ancelled — stays live until ended, vs. a fixed end date). Returns an `offerId` but the offer is **staged/unpublished**.
3. **`POST /sell/inventory/v1/offer/{offerId}/publish`** — "go live": returns the `listingId`; we build `viewUrl` = `webBase/itm/{listingId}`.

**Error cleanup:** if call 2 or 3 fails, `DELETE` the inventory item (best-effort), then re-throw the original error. SKUs are single-use, so a half-finished publish would otherwise strand the item + unpublished offer forever; deleting the item cascades to its offers. Re-throwing preserves the real failure reason for the caller.

---

## The whole eBay story in one breath

1. **config / api-routes / client / crypto** — where eBay is, its endpoints, the one request function, token safety.
2. **oauth** — 3-step handshake → store encrypted refresh token, mint access tokens on demand.
3. **identity** — read the account's immutable `userId` once (dedup key; on the `apiz` host; best-effort).
4. **account-setup** — ensure business policies + warehouse exist → 4 IDs (cached per account).
5. **listing** — 3 calls (inventory item → offer → publish) → live listing, with cleanup on failure.
