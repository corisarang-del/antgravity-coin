import { describe, expect, it, vi } from "vitest";
import { createOpenAiCompatibleProvider } from "@/infrastructure/api/openAiCompatibleProvider";

describe("createOpenAiCompatibleProvider", () => {
  it("정상 응답에서 content를 추출한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"summary":"ok"}',
              },
            },
          ],
        }),
      }),
    );

    const provider = createOpenAiCompatibleProvider({
      provider: "qwen",
      apiKey: "key",
      apiUrl: "https://example.com",
    });

    const result = await provider.generateDebateChunk(
      {
        characterId: "aira",
        characterName: "Aira",
        role: "기술분석가",
        team: "bull",
        specialty: "RSI",
        personality: "차트를 차분하게 읽어.",
        selectionReason: "기술형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: [],
        previousMessages: [],
      },
      "model",
    );

    expect(result).toContain('"summary"');
    vi.unstubAllGlobals();
  });

  it("api 정보가 없으면 null을 반환한다", async () => {
    const provider = createOpenAiCompatibleProvider({
      provider: "qwen",
      apiKey: "",
      apiUrl: "",
    });

    const result = await provider.generateDebateChunk(
      {
        characterId: "aira",
        characterName: "Aira",
        role: "기술분석가",
        team: "bull",
        specialty: "RSI",
        personality: "차트를 차분하게 읽어.",
        selectionReason: "기술형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: [],
        previousMessages: [],
      },
      "model",
    );

    expect(result).toBeNull();
  });
});
