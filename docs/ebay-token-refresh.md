# Access Token Refresh — How It Works

eBay API calls need a short-lived **access token**. We never store one; we mint a
fresh token on demand from the account's long-lived **refresh token**. Getting
the refresh token in the first place is the linking flow
(`docs/ebay-account-linking.md`); this doc is about using it afterwards.

## The difference from eBay's website

There's **no equivalent on eBay's website** — a logged-in seller just has a session
cookie. This is pure headless OAuth machinery: the app acts on the seller's behalf
without a browser, so it has to manage tokens itself.

The key design choice: **access tokens are never persisted**. Only the encrypted
refresh token lives in the database. Each publish mints a brand-new access token,
uses it, and throws it away.

## The flow

```
publishProductToAccounts(...)  needs to call eBay for an account
   ↓
getAccountAccessToken({ id, userId })        ← features/ebay-accounts/services/ebay-account-service.ts
   • SELECT refreshToken, deletedAt  WHERE id = … AND userId = …
   • deletedAt set or no token? → throw "reconnect it to publish"
   • decryptToken(refreshToken)               ← in memory only (token-cipher.ts, AES-256-GCM)
   • refreshAccessToken(plainRefreshToken)    ← lib/ebay/oauth.ts
   → returns tokens.access_token  (NOT stored anywhere)
```

The exchange itself (`lib/ebay/oauth.ts`):

```ts
POST {apiBase}/identity/v1/oauth2/token
Authorization: Basic base64(clientId:clientSecret)
Content-Type:  application/x-www-form-urlencoded

  grant_type=refresh_token
  refresh_token=<decrypted token>
  scope=<EBAY_SCOPES>          // sell.inventory + sell.account only
→ { access_token, expires_in, token_type }
```

## Two things worth noting

- **Narrower scope on refresh.** Linking consents to inventory + account **+
  identity** (so we can read the username once). The refresh path drops identity
  and asks only for the two scopes publishing actually needs.
- **`getAccountAccessToken` is the only reader of the refresh token.** It's the
  single place the encrypted token is decrypted, and the plaintext exists only in
  memory for the duration of the exchange. The token column is never selected by
  the list/detail queries.

## What's not built yet

There's no caching or proactive expiry handling — every publish mints a new
access token, even within the same batch. That's simple and correct; an
access-token cache could be added later if rate limits become a concern.

## Files

| File                                                      | Job                                                      |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `features/ebay-accounts/services/ebay-account-service.ts` | `getAccountAccessToken` — read, guard, decrypt, exchange |
| `lib/ebay/oauth.ts`                                       | `refreshAccessToken` — the token endpoint call           |
| `lib/crypto/token-cipher.ts`                              | `decryptToken` (AES-256-GCM)                             |
