import { z } from "zod";
import type { Character } from "@/features/characters/types";

export const CharacterApiItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  team: z.enum(["bull", "bear"]),
  specialty: z.string(),
  personality: z.string(),
  selectionReason: z.string(),
  imageSrc: z.string(),
  sourceImageName: z.string(),
});

export const CharacterApiResponseSchema = z.object({
  characters: z.array(CharacterApiItemSchema),
});

export type CharacterApiItem = z.infer<typeof CharacterApiItemSchema>;
export type CharacterApiResponse = z.infer<typeof CharacterApiResponseSchema>;

export function toCharacterApiItem(character: Character): CharacterApiItem {
  return {
    id: character.id,
    name: character.name,
    role: character.role,
    team: character.team,
    specialty: character.specialty,
    personality: character.personality,
    selectionReason: character.selectionReason,
    imageSrc: character.imageSrc,
    sourceImageName: character.sourceImageName,
  };
}

export function toCharacterApiResponse(characters: Character[]): CharacterApiResponse {
  return CharacterApiResponseSchema.parse({
    characters: characters.map(toCharacterApiItem),
  });
}
