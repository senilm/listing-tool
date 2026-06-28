export enum AspectGroup {
  Identification = "identification",
  Materials = "materials",
  Gemstones = "gemstones",
  Certification = "certification",
  StyleDesign = "style-design",
  SizeFit = "size-fit",
}

export const ASPECT_GROUP_ORDER: { group: AspectGroup; label: string }[] = [
  { group: AspectGroup.Identification, label: "Brand & Identification" },
  { group: AspectGroup.Materials, label: "Materials & Metal" },
  { group: AspectGroup.Gemstones, label: "Gemstones" },
  { group: AspectGroup.Certification, label: "Certification" },
  { group: AspectGroup.StyleDesign, label: "Style & Design" },
  { group: AspectGroup.SizeFit, label: "Size & Fit" },
];
