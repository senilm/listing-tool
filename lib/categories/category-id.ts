// eBay leaf category IDs we list into. Verified against eBay's live US category
// pages (production). Re-confirm leaf status + values via the Taxonomy API
// (getCategorySubtree under 281) before going live — especially Necklaces &
// Pendants, which can split into separate Necklaces / Pendants leaves.

export enum CategoryId {
  FashionRings = "67681", // Fashion Jewellery > Fashion Rings
  EngagementRings = "261975", // Engagement & Wedding > Engagement Rings
  WeddingBands = "261977", // Engagement & Wedding > Wedding & Anniversary Bands
  RingSets = "261976", // Engagement & Wedding > Engagement/Wedding Ring Sets
  NecklacesPendants = "155101", // Fashion Jewellery > Fashion Necklaces & Pendants
  Earrings = "50647", // Fashion Jewellery > Fashion Earrings
}
