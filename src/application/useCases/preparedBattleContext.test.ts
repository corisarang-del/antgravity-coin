import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryGetByCoinId = vi.fn();
const repositorySave = vi.fn();
const getBattleMarketSnapshot = vi.fn();
const getReusableDebateContext = vi.fn();

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

    const { getPreparedBattleContext } = await import("@/application/useCases/preparedBattleContext");

    const first = getPreparedBattleContext("bitcoin");
    const second = getPreparedBattleContext("bitcoin");

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.context.coinId).toBe("bitcoin");
    expect(secondResult.context.coinId).toBe("bitcoin");
    expect(firstResult.context.firstTurnDrafts).toEqual({});
    expect(firstResult.preparedFirstTurnHit).toBe(false);
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

    const { prewarmPreparedBattleContext } = await import("@/application/useCases/preparedBattleContext");

    const result = await prewarmPreparedBattleContext("bitcoin");

    expect(result.preparedContextHit).toBe(true);
    expect(result.preparedFirstTurnHit).toBe(true);
    expect(result.refreshQueued).toBe(true);
    expect(result.context.summary.headline).toBe("BTC 기존 요약");

    await vi.waitFor(() => {
      expect(repositorySave).toHaveBeenCalledTimes(1);
    });
  });
});
