// Linked eBay account status. Single source of truth for the ebay_account_status
// Postgres enum (lib/db/schema/ebay-account.ts imports this) and the UI badge.
export enum EbayAccountStatus {
  Active = "active",
  NeedsReconsent = "needs_reconsent",
  Disabled = "disabled",
}
