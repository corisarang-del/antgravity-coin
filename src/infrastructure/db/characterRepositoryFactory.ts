import type { CharacterRepository } from "@/application/ports/CharacterRepository";
import { ExternalCharacterRepository } from "@/infrastructure/db/externalCharacterRepository";
import { LocalCharacterRepository } from "@/infrastructure/db/localCharacterRepository";
import { envConfig } from "@/shared/constants/envConfig";

export function createCharacterRepository(
  source = envConfig.charactersSource,
): CharacterRepository {
  return source === "external"
    ? new ExternalCharacterRepository()
    : new LocalCharacterRepository();
}
