import type { CharacterApiResponse } from "@/features/characters/api";

export interface CharacterRepository {
  fetchCharacters(): Promise<CharacterApiResponse>;
}
