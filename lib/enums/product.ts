// Condition of the master listing. Kept deliberately small and eBay-agnostic —
// publish (step 5) maps these to eBay's numeric condition IDs per category.
export enum ProductCondition {
  New = "new",
  NewOther = "new_other",
  PreOwned = "pre_owned",
}
