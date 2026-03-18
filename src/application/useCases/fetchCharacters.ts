import type { CharacterRepository } from "@/application/ports/CharacterRepository";

export async function fetchCharacters(repository: CharacterRepository) {
  return repository.fetchCharacters();
}
