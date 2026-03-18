import type { CharacterRepository } from "@/application/ports/CharacterRepository";
import { getCharacterApiSeed } from "@/shared/constants/characters";

export class LocalCharacterRepository implements CharacterRepository {
  async fetchCharacters() {
    return getCharacterApiSeed();
  }
}
