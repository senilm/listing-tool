# Listing Tool — Data Schema

Jewellery multi-account eBay listing tool. Store one master product, publish it to
many linked eBay accounts with per-publish overrides. Single-SKU products,
per-publish full snapshots, normal email+password auth, scope = publishing +
scheduling only.

> **Stack is now pinned: Postgres (Neon) via Drizzle.** Types below reflect the
> implemented schema in `lib/db/schema/`. The `user` table (and `session`,
> `account`, `verification`, not diagrammed) are owned by Better Auth — see the
> Auth note below.

## ER diagram

```mermaid
erDiagram
    USER ||--o{ EBAY_ACCOUNT : owns
    USER ||--o{ PRODUCT : owns
    USER ||--o{ PUBLICATION : owns
    PRODUCT ||--o{ PUBLICATION : "fans out to"
    EBAY_ACCOUNT ||--o{ PUBLICATION : receives

    USER {
        text id PK "Better Auth (text, not uuid)"
        string name
        string email UK
        boolean email_verified
        string image "nullable"
        timestamp created_at
        timestamp updated_at
    }

    EBAY_ACCOUNT {
        uuid id PK
        text user_id FK
        string label "nickname, e.g. Store A"
        string ebay_username "from identity, optional"
        text refresh_token "ENCRYPTED at rest"
        timestamp refresh_token_expires_at "drives re-consent"
        json scopes "granted OAuth scopes"
        enum status "active | needs_reconsent"
        string payment_policy_id "cached setup"
        string return_policy_id "cached setup"
        string fulfillment_policy_id "cached setup"
        string merchant_location_key "cached setup"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "soft delete (disconnect), nullable"
    }

    PRODUCT {
        uuid id PK
        text user_id FK
        string sku "internal reference, optional"
        string title
        text description
        string condition
        decimal base_price
        string currency
        string category_id "eBay leaf category"
        int quantity
        json images "ordered array of URLs"
        json aspects "jewellery specifics map"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "soft delete, nullable"
    }

    PUBLICATION {
        uuid id PK
        text user_id FK "scoping"
        uuid product_id FK
        uuid ebay_account_id FK
        enum status "draft | scheduled | publishing | published | failed | ended"
        timestamp scheduled_at "nullable"
        timestamp published_at "nullable"
        string title "snapshot, seeded from product"
        text description "snapshot"
        decimal price "snapshot"
        string currency "snapshot"
        int quantity "snapshot"
        string category_id "snapshot"
        json images "snapshot"
        json aspects "snapshot"
        json overridden_fields "changed field names, for UI"
        string ebay_sku "eBay result"
        string ebay_offer_id "eBay result"
        string ebay_listing_id "eBay result"
        text error_message "nullable"
        timestamp created_at
        timestamp updated_at
    }
```

## Notes

- **Auth tables (Better Auth)**: `user` plus `session`, `account`, `verification`
  (not diagrammed) are managed by Better Auth and generated via `pnpm auth:generate`.
  Passwords are stored hashed in `account.password`, **not** on `user`. `user.id` is
  `text`, so every `user_id` FK is `text` (domain PKs remain `uuid`).
- **Ownership / scoping**: every `ebay_account`, `product`, and `publication` belongs
  to a `user`. `publication.user_id` is denormalized so we can query "everything for
  this user" directly. All FKs are `ON DELETE CASCADE`.
- **No per-account `environment`**: dropped — sandbox vs production is app-wide
  (driven by `EBAY_ENV`), not stored per account.
- **Publication = full snapshot**: the listing content (title, price, images, aspects,
  …) is copied onto the publication, seeded from the product and individually
  overridable. Past publications are immune to later product edits; clear audit of
  exactly what was listed where.
- **No (product, account) uniqueness**: we keep history and allow re-listing, so a
  product can have many publication rows per account over time.
- **Key queries**: publications by account, by user, by status (e.g. all `scheduled`,
  all `published`), by product.
- **Security**: `ebay_account.refresh_token` is to be encrypted at rest (planned in
  the service layer when account linking is built — not yet implemented).
- **Out of scope (for now)**: inventory/quantity sync, orders/sales, multi-variation
  listings, fan-out batch grouping. A category/required-aspects cache table may be
  added when wiring up the Taxonomy API.
