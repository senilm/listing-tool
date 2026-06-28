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

export enum MainStoneTreatment {
  NotEnhanced = "Not Enhanced",
  Heated = "Heated",
  HeatedPressureTreated = "Heated & Pressure Treated",
  Irradiated = "Irradiated",
  Diffusion = "Diffusion",
  Dyed = "Dyed",
  Filled = "Filled",
  ClarityEnhanced = "Clarity Enhanced",
  Coated = "Coated",
  Bleached = "Bleached",
  Stabilized = "Stabilized",
}

export enum CutGrade {
  Ideal = "Ideal",
  Excellent = "Excellent",
  VeryGood = "Very Good",
  Good = "Good",
  Fair = "Fair",
  Poor = "Poor",
}

export enum ColorGrade {
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N",
  OP = "O-P",
  QR = "Q-R",
  ST = "S-T",
  UV = "U-V",
  WX = "W-X",
  YZ = "Y-Z",
  Fancy = "Fancy",
}

export enum ClarityGrade {
  FL = "FL",
  IF = "IF",
  VVS1 = "VVS1",
  VVS2 = "VVS2",
  VS1 = "VS1",
  VS2 = "VS2",
  SI1 = "SI1",
  SI2 = "SI2",
  I1 = "I1",
  I2 = "I2",
  I3 = "I3",
}

export enum Theme {
  LoveAndHearts = "Love & Hearts",
  WeddingAndEngagement = "Wedding & Engagement",
  Anniversary = "Anniversary",
  Birthstone = "Birthstone",
  Religious = "Religious",
  Nature = "Nature",
  Animal = "Animal",
  Celestial = "Celestial",
  Floral = "Floral",
  Friendship = "Friendship",
  Family = "Family",
  Beauty = "Beauty",
}

export enum Occasion {
  Engagement = "Engagement",
  Wedding = "Wedding",
  Anniversary = "Anniversary",
  Birthday = "Birthday",
  ValentinesDay = "Valentine's Day",
  MothersDay = "Mother's Day",
  Christmas = "Christmas",
  Graduation = "Graduation",
  Everyday = "Everyday",
}

export enum Color {
  Yellow = "Yellow",
  White = "White",
  Rose = "Rose",
  Gold = "Gold",
  Silver = "Silver",
  Black = "Black",
  Blue = "Blue",
  Green = "Green",
  Red = "Red",
  Pink = "Pink",
  Purple = "Purple",
  Multicolour = "Multicolour",
}

export enum Features {
  Adjustable = "Adjustable",
  Stackable = "Stackable",
  Engraved = "Engraved",
  ComfortFit = "Comfort Fit",
  Hypoallergenic = "Hypoallergenic",
  NickelFree = "Nickel Free",
  Handmade = "Handmade",
  Resizable = "Resizable",
}

export enum YesNo {
  Yes = "Yes",
  No = "No",
}

export enum NecklaceType {
  Chain = "Chain",
  Pendant = "Pendant",
  Choker = "Choker",
  Collar = "Collar",
  Lariat = "Lariat/Y-Necklace",
  Beaded = "Beaded",
  Statement = "Statement",
  Locket = "Locket",
  Charm = "Charm",
  Pearl = "Pearl",
  Station = "Station",
}

export enum ClaspType {
  LobsterClaw = "Lobster Claw",
  SpringRing = "Spring Ring",
  Toggle = "Toggle",
  Magnetic = "Magnetic",
  Box = "Box",
  HookAndEye = "Hook & Eye",
  Barrel = "Barrel",
  Fishhook = "Fishhook",
  SHook = "S-Hook",
  Slide = "Slide",
}

export enum EarringType {
  Stud = "Stud",
  Drop = "Drop",
  Dangle = "Dangle",
  Hoop = "Hoop",
  Huggie = "Huggie",
  Chandelier = "Chandelier",
  EarClimber = "Ear Climber",
  Threader = "Threader",
  Cluster = "Cluster",
  Jacket = "Jacket",
}

export enum Fastening {
  PushBack = "Push Back",
  ButterflyBack = "Butterfly Back",
  LeverBack = "Lever Back",
  ScrewBack = "Screw Back",
  Hook = "Hook",
  Hinged = "Hinged",
  LatchBack = "Latch Back",
  FishHook = "Fish Hook",
  ClipOn = "Clip-On",
  EarWire = "Ear Wire",
}
