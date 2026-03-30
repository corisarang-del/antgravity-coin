import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/constants/envConfig", () => ({
  envConfig: {
    openRouterApiKey: "key",
    openRouterBaseUrl: "https://openrouter.ai/api/v1/chat/completions",
  },
}));

describe("openRouterProvider", () => {
  it("실패 로그에 raw response body를 남기지 않는다", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => '{"detail":"secret-ish upstream payload"}',
      }),
    );

    const { openRouterProvider } = await import("@/infrastructure/api/openRouterProvider");

    const result = await openRouterProvider.generateDebateChunk(
      {
        characterId: "judy",
        characterName: "Judy",
        role: "뉴스 스카우터",
        team: "bull",
        specialty: "뉴스",
        personality: "재료를 먼저 보는 타입이야.",
        selectionReason: "뉴스형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: [],
        recentBattleLessons: [],
        characterLessons: [],
        previousMessages: [],
      },
      "qwen/qwen3.5-9b",
    );

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const loggedMessage = String(warnSpy.mock.calls[0]?.[0] ?? "");
    expect(loggedMessage).toContain("responseBodyLength=");
    expect(loggedMessage).not.toContain("secret-ish upstream payload");

    warnSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
