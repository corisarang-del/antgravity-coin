export type Team = "bull" | "bear";

export type CharacterAccentTone = "rose" | "cream" | "butter";

export interface CharacterBeginnerGuideItem {
  term: string;
  easyMeaning: string;
  whyItMatters: string;
}

export interface CharacterCatalogEntry {
  id: string;
  name: string;
  role: string;
  team: Team;
  specialty: string;
  beginnerSummary: string;
  beginnerGuide: CharacterBeginnerGuideItem[];
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
