import { envConfig } from "@/shared/constants/envConfig";
import { NextResponse } from "next/server";
import { fetchCharacters } from "@/application/useCases/fetchCharacters";
import { LocalCharacterRepository } from "@/infrastructure/db/localCharacterRepository";
import { createCharacterRepository } from "@/infrastructure/db/characterRepositoryFactory";

export async function GET() {
  try {
    const repository = createCharacterRepository();
    const characters = await fetchCharacters(repository);
    return NextResponse.json(characters, {
      headers: {
        "x-characters-source": envConfig.charactersSource,
        "x-characters-fallback": "false",
      },
    });
  } catch {
    const fallbackRepository = new LocalCharacterRepository();
    const characters = await fetchCharacters(fallbackRepository);
    return NextResponse.json(characters, {
      headers: {
        "x-characters-source": "local",
        "x-characters-fallback": "true",
      },
    });
  }
}
