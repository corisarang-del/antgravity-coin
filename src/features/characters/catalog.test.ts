import { characterCatalog } from "@/features/characters/catalog";
import { characters, getCharacterApiSeed } from "@/features/characters";

describe("characterCatalog", () => {
  it("편집용 카탈로그와 실제 런타임 데이터 개수가 일치한다", () => {
    expect(characterCatalog).toHaveLength(8);
    expect(characters).toHaveLength(characterCatalog.length);
  });

  it("카탈로그만 수정해도 api seed에 필요한 필드가 생성된다", () => {
    const apiSeed = getCharacterApiSeed();

    expect(apiSeed.characters).toHaveLength(8);
    expect(apiSeed.characters[0]).toHaveProperty("name");
    expect(apiSeed.characters[0]).toHaveProperty("specialty");
    expect(apiSeed.characters[0]).toHaveProperty("personality");
  });
});
