import { characterCatalog } from "@/features/characters/catalog";
import { toCharacterApiResponse } from "@/features/characters/api";
import type { Character } from "@/features/characters/types";

function buildImageVersion(sourceImageName: string) {
  return sourceImageName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-12)
    .toLowerCase();
}

function buildCharacter(entry: (typeof characterCatalog)[number]): Character {
  const imageVersion = buildImageVersion(entry.sourceImageName);
  const imageSrc = `/characters/${entry.imageFileName}?v=${imageVersion}`;

  return {
    ...entry,
    imageSrc,
    posterSrc: imageSrc,
    previewSrc: imageSrc,
  };
}

export const characters: Character[] = characterCatalog.map(buildCharacter);

export function getCharacterById(id: string) {
  return characters.find((character) => character.id === id) ?? null;
}

export function getCharacterApiSeed() {
  return toCharacterApiResponse(characters);
}

export { CharacterApiItemSchema, CharacterApiResponseSchema, toCharacterApiItem, toCharacterApiResponse } from "@/features/characters/api";
export type { CharacterApiItem, CharacterApiResponse } from "@/features/characters/api";
export type { Character, CharacterCatalogEntry, Team } from "@/features/characters/types";
