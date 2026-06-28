export enum AuditAction {
  ProductCreated = "product.created",
  ProductUpdated = "product.updated",
  ProductDeleted = "product.deleted",

  PublicationPublished = "publication.published",
  PublicationFailed = "publication.failed",
  EbayAccountLinked = "ebay_account.linked",

  EbayAccountDisconnected = "ebay_account.disconnected",
  EbayAccountRenamed = "ebay_account.renamed",
}

export enum AuditEntityType {
  Product = "product",
  Publication = "publication",
  EbayAccount = "ebay_account",
}
