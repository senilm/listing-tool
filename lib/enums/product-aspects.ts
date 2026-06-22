// Dropdown values for jewellery item specifics, scoped to rings for now. Each
// enum value is the exact string eBay accepts as the aspect's localizedValue —
// publish (step 5) sends these verbatim, so they must match eBay's allowed
// values for the ring category or the offer call rejects them. These are
// hand-maintained; revisit when eBay changes its accepted aspect values.

export enum Metal {
  YellowGold = "Yellow Gold",
  WhiteGold = "White Gold",
  RoseGold = "Rose Gold",
  Gold = "Gold",
  SterlingSilver = "Sterling Silver",
  Silver = "Silver",
  Platinum = "Platinum",
  Palladium = "Palladium",
  Titanium = "Titanium",
  StainlessSteel = "Stainless Steel",
  Tungsten = "Tungsten",
  Brass = "Brass",
}

export enum MetalPurity {
  Gold9k = "375 (9k)",
  Gold14k = "585 (14k)",
  Gold18k = "750 (18k)",
  Gold22k = "916 (22k)",
  Gold24k = "999 (24k)",
  Silver925 = "925 (Sterling Silver)",
  Platinum950 = "950 (Platinum)",
  Palladium950 = "950 (Palladium)",
}

export enum Stone {
  Diamond = "Diamond",
  CubicZirconia = "Cubic Zirconia",
  Moissanite = "Moissanite",
  Sapphire = "Sapphire",
  Ruby = "Ruby",
  Emerald = "Emerald",
  Opal = "Opal",
  Pearl = "Pearl",
  Amethyst = "Amethyst",
  Topaz = "Topaz",
  Aquamarine = "Aquamarine",
  Garnet = "Garnet",
  None = "No Stone",
}

export enum MainStoneCreation {
  Natural = "Natural",
  LabCreated = "Lab-Created",
  Simulated = "Simulated",
}

export enum StoneColor {
  White = "White",
  Colorless = "Colorless",
  Blue = "Blue",
  Green = "Green",
  Red = "Red",
  Pink = "Pink",
  Purple = "Purple",
  Yellow = "Yellow",
  Orange = "Orange",
  Brown = "Brown",
  Black = "Black",
  Multicolour = "Multicolour",
}

export enum StoneShape {
  Round = "Round",
  Oval = "Oval",
  Princess = "Princess",
  Cushion = "Cushion",
  Emerald = "Emerald",
  Pear = "Pear",
  Marquise = "Marquise",
  Heart = "Heart",
  Asscher = "Asscher",
  Radiant = "Radiant",
  Baguette = "Baguette",
}

export enum SettingStyle {
  Prong = "Prong",
  Bezel = "Bezel",
  Pave = "Pavé",
  Channel = "Channel",
  Tension = "Tension",
  Halo = "Halo",
  Cluster = "Cluster",
  Flush = "Flush",
  Solitaire = "Solitaire",
}

export enum RingStyle {
  Solitaire = "Solitaire",
  Halo = "Halo",
  ThreeStone = "Three-Stone",
  Eternity = "Eternity",
  Cluster = "Cluster",
  Cocktail = "Cocktail",
  Band = "Band",
  Signet = "Signet",
  Stackable = "Stackable",
}

export enum Department {
  Women = "Women",
  Men = "Men",
  UnisexAdults = "Unisex Adults",
  Girls = "Girls",
  Boys = "Boys",
}

export enum Certification {
  GIA = "GIA",
  IGI = "IGI",
  AGS = "AGS",
  EGL = "EGL",
  HRD = "HRD",
  GCAL = "GCAL",
  None = "None",
}

export enum Sizable {
  Yes = "Yes",
  No = "No",
}
