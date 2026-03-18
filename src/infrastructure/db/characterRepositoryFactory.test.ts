import { describe, expect, it } from "vitest";
import { createCharacterRepository } from "@/infrastructure/db/characterRepositoryFactory";
import { ExternalCharacterRepository } from "@/infrastructure/db/externalCharacterRepository";
import { LocalCharacterRepository } from "@/infrastructure/db/localCharacterRepository";

describe("createCharacterRepository", () => {
  it("local이면 로컬 저장소를 쓴다", () => {
    expect(createCharacterRepository("local")).toBeInstanceOf(LocalCharacterRepository);
  });

  it("external이면 외부 저장소를 쓴다", () => {
    expect(createCharacterRepository("external")).toBeInstanceOf(ExternalCharacterRepository);
  });
});
