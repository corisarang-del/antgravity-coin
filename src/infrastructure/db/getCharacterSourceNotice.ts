import { fetchCharacters } from "@/application/useCases/fetchCharacters";
import { createCharacterRepository } from "@/infrastructure/db/characterRepositoryFactory";
import { LocalCharacterRepository } from "@/infrastructure/db/localCharacterRepository";
import { envConfig } from "@/shared/constants/envConfig";

export async function getCharacterSourceNotice() {
  try {
    await fetchCharacters(createCharacterRepository());

    if (envConfig.charactersSource === "external") {
      return "외부 캐릭터 소스 기준으로 동기화한 라인업을 확인 중이야.";
    }

    return null;
  } catch {
    await fetchCharacters(new LocalCharacterRepository());
    return "외부 캐릭터 소스 연결이 불안정해서 지금은 기본 라인업을 보여주고 있어.";
  }
}
