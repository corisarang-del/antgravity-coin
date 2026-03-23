import { envConfig } from "@/shared/constants/envConfig";
import { CharacterApiResponseSchema, type CharacterApiResponse } from "@/features/characters/api";

function buildHeaders() {
  return new Headers({
    accept: "application/json",
  });
}

export async function fetchExternalCharacters(): Promise<CharacterApiResponse> {
  if (!envConfig.charactersApiUrl) {
    throw new Error("CHARACTERS_API_URL is not configured");
  }

  const response = await fetch(envConfig.charactersApiUrl, {
    headers: buildHeaders(),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Character API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return CharacterApiResponseSchema.parse(payload);
}
