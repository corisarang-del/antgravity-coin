import { characterCatalog } from "@/features/characters/catalog";
import { characters } from "@/features/characters";
import { CharacterApiResponseSchema, toCharacterApiResponse } from "@/features/characters/api";

describe("character api schema", () => {
  it("catalog 기반으로 안정적인 api 응답을 만든다", () => {
    expect(characterCatalog).toHaveLength(8);

    const payload = toCharacterApiResponse(characters);
    const parsed = CharacterApiResponseSchema.parse(payload);

    expect(parsed.characters).toHaveLength(8);
    expect(parsed.characters[0]).toHaveProperty("selectionReason");
    expect(parsed.characters[0]).toHaveProperty("imageSrc");
    expect(parsed.characters[0]).toHaveProperty("beginnerSummary");
    expect(parsed.characters[0]).toHaveProperty("beginnerGuide");
    expect(parsed.characters[0]?.beginnerGuide[0]).toHaveProperty("whyItMatters");
    expect(parsed.characters[0].imageSrc).toContain("?v=");
  });
});
