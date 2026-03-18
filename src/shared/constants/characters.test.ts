import { characters, getCharacterApiSeed } from "@/shared/constants/characters";

describe("characters", () => {
  it("keeps eight unique characters with versioned webp images", () => {
    expect(characters).toHaveLength(8);

    const ids = new Set(characters.map((character) => character.id));
    expect(ids.size).toBe(8);

    for (const character of characters) {
      expect(character.imageSrc).toMatch(/^\/characters\/[a-z0-9-]+\.webp\?v=[a-z0-9]+$/);
      expect(character.personality.length).toBeGreaterThan(0);
      expect(character.selectionReason.length).toBeGreaterThan(0);
    }
  });

  it("preserves the requested source images for key characters", () => {
    const aira = characters.find((character) => character.id === "aira");
    const clover = characters.find((character) => character.id === "clover");
    const flip = characters.find((character) => character.id === "flip");
    const ledger = characters.find((character) => character.id === "ledger");
    const shade = characters.find((character) => character.id === "shade");
    const vela = characters.find((character) => character.id === "vela");

    expect(aira?.sourceImageName).toContain("98d50a44-08e8-47b6-a5c4-5f9dc34371a4_2.png");
    expect(clover?.sourceImageName).toContain("7e6e836f-faab-4a1b-aec4-a0d486831fa5_2.png");
    expect(flip?.sourceImageName).toContain("9766d1e1-88a1-4ff2-b70d-97a2a9c5cfd0_2.png");
    expect(ledger?.sourceImageName).toContain("f7fe06d1-1739-4737-82b0-61a856fc78f7_0.png");
    expect(shade?.sourceImageName).toContain("e2d0e08e-7f23-4c07-ac30-05911bf5a85f_2.png");
    expect(vela?.sourceImageName).toContain("7ee2bae4-41be-4ff3-baa7-f1cfbe4d23ab_0.png");
    expect(clover?.imageSrc).toContain("/characters/clover.webp?v=");
    expect(flip?.imageSrc).toContain("/characters/flip.webp?v=");
    expect(ledger?.imageSrc).toContain("/characters/ledger.webp?v=");
  });

  it("still builds an api seed from the shared constants entry point", () => {
    const apiSeed = getCharacterApiSeed();

    expect(apiSeed.characters).toHaveLength(8);
    expect(apiSeed.characters[0]).toHaveProperty("id");
    expect(apiSeed.characters[0]).toHaveProperty("name");
    expect(apiSeed.characters[0]).toHaveProperty("imageSrc");
  });
});
