import { beforeEach, describe, expect, it, vi } from "vitest";

describe("GET /api/characters", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.CHARACTERS_SOURCE;
    delete process.env.CHARACTERS_API_URL;
  });

  it("기본값으로 로컬 카탈로그 8명 데이터를 반환한다", async () => {
    const { GET } = await import("@/app/api/characters/route");
    const response = await GET();
    const payload = (await response.json()) as { characters: Array<{ id: string; imageSrc: string }> };

    expect(payload.characters).toHaveLength(8);
    expect(payload.characters[0]).toHaveProperty("id");
    expect(payload.characters[0].imageSrc).toMatch(/^\/characters\/.+\.webp\?v=/);
    expect(response.headers.get("x-characters-source")).toBe("local");
    expect(response.headers.get("x-characters-fallback")).toBe("false");
  });

  it("external 설정이면 외부 API 응답을 사용한다", async () => {
    process.env.CHARACTERS_SOURCE = "external";
    process.env.CHARACTERS_API_URL = "https://example.com/api/characters";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          characters: [
            {
              id: "remote-1",
              name: "Remote",
              role: "원격 분석가",
              team: "bull",
              specialty: "외부 API 데이터",
              personality: "원격 소스에서 내려온 캐릭터야.",
              selectionReason: "외부 데이터 전환 테스트용이야.",
              imageSrc: "/characters/remote.webp",
              sourceImageName: "remote.png",
            },
          ],
        }),
      }),
    );

    const { GET } = await import("@/app/api/characters/route");
    const response = await GET();
    const payload = (await response.json()) as { characters: Array<{ id: string }> };

    expect(payload.characters).toHaveLength(1);
    expect(payload.characters[0].id).toBe("remote-1");
    expect(response.headers.get("x-characters-source")).toBe("external");
    expect(response.headers.get("x-characters-fallback")).toBe("false");
    vi.unstubAllGlobals();
  });

  it("external 소스가 실패하면 로컬 카탈로그로 fallback한다", async () => {
    process.env.CHARACTERS_SOURCE = "external";
    process.env.CHARACTERS_API_URL = "https://example.com/api/characters";

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failed")));

    const { GET } = await import("@/app/api/characters/route");
    const response = await GET();
    const payload = (await response.json()) as { characters: Array<{ id: string }> };

    expect(payload.characters).toHaveLength(8);
    expect(payload.characters[0]).toHaveProperty("id");
    expect(response.headers.get("x-characters-source")).toBe("local");
    expect(response.headers.get("x-characters-fallback")).toBe("true");
    vi.unstubAllGlobals();
  });
});
