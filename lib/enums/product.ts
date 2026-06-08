// Product lifecycle. Single source of truth for the product_status Postgres
// enum (lib/db/schema/product.ts imports this) and the UI badge. Archived is a
// soft-delete state: the row (and its publications) stay, but it drops out of
// the default list.
export enum ProductStatus {
  Active = "active",
  Archived = "archived",
}

// Condition of the master listing. Kept deliberately small and eBay-agnostic —
// publish (step 5) maps these to eBay's numeric condition IDs per category.
export enum ProductCondition {
  New = "new",
  NewOther = "new_other",
  PreOwned = "pre_owned",
}
