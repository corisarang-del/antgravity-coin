import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryGetByCoinId = vi.fn();
const repositorySave = vi.fn();
const getBattleMarketSnapshot = vi.fn();
const getReusableDebateContext = vi.fn();
const generateCharacterMessage = vi.fn();

vi.mock("@/infrastructure/db/filePreparedBattleContextRepository", () => ({
  FilePreparedBattleContextRepository: class {
    getByCoinId = repositoryGetByCoinId;
    save = repositorySave;
  },
}));

vi.mock("@/application/useCases/getBattleMarketSnapshot", () => ({
  getBattleMarketSnapshot,
}));

vi.mock("@/application/useCases/getReusableDebateContext", () => ({
  getReusableDebateContext,
}));

vi.mock("@/application/useCases/generateBattleDebate", () => ({
  generateCharacterMessage,
}));

describe("preparedBattleContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("같은 코인의 stale build가 동시에 들어와도 한 번만 생성한다", async () => {
    repositoryGetByCoinId.mockResolvedValue(null);
    getBattleMarketSnapshot.mockResolvedValue({
      marketData: {
        coinId: "bitcoin",
        symbol: "BTC",
      },
      summary: {
        headline: "BTC 요약",
        bias: "bull",
        indicators: [],
      },
    });
    getReusableDebateContext.mockResolvedValue({
      recentBattleLessons: [],
      characterLessonsById: {},
    });

    const resolveDrafts: Array<(value: unknown) => void> = [];
    generateCharacterMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDrafts.push(resolve);
        }),
    );

    const { getPreparedBattleContext } = await import("@/application/useCases/preparedBattleContext");

    const first = getPreparedBattleContext("bitcoin");
    const second = getPreparedBattleContext("bitcoin");

    await vi.waitFor(() => {
      expect(generateCharacterMessage).toHaveBeenCalledTimes(2);
    });

    resolveDrafts[0]?.({
      id: "draft-1",
      characterId: "aira",
      characterName: "Aira",
      team: "bull",
      stance: "bullish",
      summary: "준비된 첫 발언",
      detail: "[원소스: market] RSI: 61.2",
      indicatorLabel: "RSI",
      indicatorValue: "61.2",
      provider: "prep",
      model: "prep-draft",
      fallbackUsed: false,
      createdAt: new Date().toISOString(),
    });
    resolveDrafts[1]?.({
      id: "draft-2",
      characterId: "ledger",
      characterName: "Ledger",
      team: "bear",
      stance: "bearish",
      summary: "준비된 첫 반박",
      detail: "[원소스: market] longShortRatio: 1.08",
      indicatorLabel: "롱숏 비율",
      indicatorValue: "1.08",
      provider: "prep",
      model: "prep-draft",
      fallbackUsed: false,
      createdAt: new Date().toISOString(),
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.context.coinId).toBe("bitcoin");
    expect(secondResult.context.coinId).toBe("bitcoin");
    expect(firstResult.context.firstTurnDrafts.aira?.summary).toBe("준비된 첫 발언");
    expect(firstResult.context.firstTurnDrafts.ledger?.summary).toBe("준비된 첫 반박");
    expect(repositorySave).toHaveBeenCalledTimes(1);
  });

  it("hard TTL 안의 stale cache는 즉시 반환하고 refresh를 백그라운드로 넘긴다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-21T00:00:00.000Z"));

    repositoryGetByCoinId.mockResolvedValue({
      coinId: "bitcoin",
      marketData: {
        coinId: "bitcoin",
        symbol: "BTC",
      },
      summary: {
        headline: "BTC 기존 요약",
        bias: "bull",
        indicators: [],
      },
      reusableDebateContext: {
        recentBattleLessons: [],
        characterLessonsById: {},
      },
      preparedEvidence: {},
      firstTurnDrafts: {
        aira: {
          id: "cached-draft",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "캐시된 첫 발언",
          detail: "[원소스: market] RSI: 58.2",
          indicatorLabel: "RSI",
          indicatorValue: "58.2",
          provider: "prep",
          model: "prep-draft",
          fallbackUsed: false,
          createdAt: "2026-03-20T23:56:00.000Z",
        },
      },
      preparedAt: "2026-03-20T23:57:30.000Z",
    });

    getBattleMarketSnapshot.mockResolvedValue({
      marketData: {
        coinId: "bitcoin",
        symbol: "BTC",
      },
      summary: {
        headline: "BTC 새 요약",
        bias: "bull",
        indicators: [],
      },
    });
    getReusableDebateContext.mockResolvedValue({
      recentBattleLessons: [],
      characterLessonsById: {},
    });
    generateCharacterMessage
      .mockResolvedValueOnce({
        id: "draft-2",
        characterId: "aira",
        characterName: "Aira",
        team: "bull",
        stance: "bullish",
        summary: "새 첫 발언",
        detail: "[원소스: market] RSI: 61.2",
        indicatorLabel: "RSI",
        indicatorValue: "61.2",
        provider: "prep",
        model: "prep-draft",
        fallbackUsed: false,
        createdAt: "2026-03-21T00:00:00.000Z",
      })
      .mockResolvedValueOnce({
        id: "draft-3",
        characterId: "ledger",
        characterName: "Ledger",
        team: "bear",
        stance: "bearish",
        summary: "새 첫 반박",
        detail: "[원소스: market] longShortRatio: 1.10",
        indicatorLabel: "롱숏 비율",
        indicatorValue: "1.10",
        provider: "prep",
        model: "prep-draft",
        fallbackUsed: false,
        createdAt: "2026-03-21T00:00:00.000Z",
      });

    const { prewarmPreparedBattleContext } = await import("@/application/useCases/preparedBattleContext");

    const result = await prewarmPreparedBattleContext("bitcoin");

    expect(result.preparedContextHit).toBe(true);
    expect(result.preparedFirstTurnHit).toBe(true);
    expect(result.refreshQueued).toBe(true);
    expect(result.context.summary.headline).toBe("BTC 기존 요약");

    await vi.waitFor(() => {
      expect(generateCharacterMessage).toHaveBeenCalledTimes(2);
      expect(repositorySave).toHaveBeenCalledTimes(1);
    });
  });
});
