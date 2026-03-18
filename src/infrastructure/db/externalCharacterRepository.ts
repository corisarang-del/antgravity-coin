import type { CharacterRepository } from "@/application/ports/CharacterRepository";
import { fetchExternalCharacters } from "@/infrastructure/api/characterApiClient";

export class ExternalCharacterRepository implements CharacterRepository {
  async fetchCharacters() {
    return fetchExternalCharacters();
  }
}
