export type Team = "bull" | "bear";

export type CharacterAccentTone = "rose" | "cream" | "butter";

export interface CharacterCatalogEntry {
  id: string;
  name: string;
  role: string;
  team: Team;
  specialty: string;
  emoji: string;
  imageFileName: string;
  sourceImageName: string;
  personality: string;
  selectionReason: string;
  accentTone: CharacterAccentTone;
}

export interface Character extends CharacterCatalogEntry {
  imageSrc: string;
  posterSrc: string;
  previewSrc: string;
}
