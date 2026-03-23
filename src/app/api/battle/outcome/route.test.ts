import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/battle/outcome/route";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import * as requestRateLimiter from "@/shared/utils/requestRateLimiter";

vi.mock("@/infrastructure/api/geminiSynthesisClient", () => ({
  synthesizeBattleReportWithGemini: vi.fn().mockResolvedValue(null),
  synthesizeBattleLessonsWithGemini: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/application/useCases/fetchBattleSettlement", () => ({
  fetchBattleSettlement: vi.fn().mockResolvedValue({
    battleId: "battle-1",
    timeframe: "24h",
    settlementAt: "2026-03-21T00:00:00.000Z",
    priceSource: "bybit-linear",
    marketSymbol: "BTCUSDT",
    entryPrice: 84000,
    settledPrice: 86000,
    priceChangePercent: 2.38,
    winningTeam: "bull",
    status: "settled",
  }),
}));

vi.mock("@/infrastructure/auth/requestOwner", () => ({
  getRequestOwnerId: vi.fn().mockResolvedValue({
    ownerId: "anonymous",
    isAuthenticated: false,
    user: null,
    supabase: {} as never,
  }),
}));

function createOutcomeRequest(input?: {
  battleId?: string;
  summary?: string;
  mode?: "settlement" | "full";
}) {
  return new Request("http://localhost/api/battle/outcome", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: input?.mode,
      userBattle: {
        battleId: input?.battleId ?? "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt: "2026-03-20T00:00:00.000Z",
        settlementAt: "2026-03-21T00:00:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
      messages: [
        {
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: input?.summary ?? "강한 상승 모멘텀이 이어지고 있어.",
          detail: "detail",
          indicatorLabel: "RSI",
          indicatorValue: "61",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  });
}

describe("POST /api/battle/outcome", () => {
  beforeEach(() => {
    requestRateLimiter.clearRequestRateLimitStore();
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "anonymous",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });
  });

  it("배틀 결과를 outcome, memory, report 구조로 변환한다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;
    const response = await POST(createOutcomeRequest({ battleId }));

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string; ruleVersion: string; settledPrice: number };
      characterMemorySeeds: Array<{ characterId: string }>;
      playerDecisionSeed: { selectedTeam: string; marketSymbol: string };
      report: { report: string };
      reportSource: "gemini" | "fallback";
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe(battleId);
    expect(data.battleOutcomeSeed.ruleVersion).toBe("v1");
    expect(data.battleOutcomeSeed.settledPrice).toBe(86000);
    expect(data.characterMemorySeeds[0]?.characterId).toBe("aira");
    expect(data.playerDecisionSeed.selectedTeam).toBe("bull");
    expect(data.playerDecisionSeed.marketSymbol).toBe("BTCUSDT");
    expect(data.report.report).toContain("BTC");
    expect(data.reportSource).toBe("fallback");
  });

  it("battleId 기준으로 저장한 outcome을 조회한다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;
    await POST(createOutcomeRequest({ battleId }));
    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotByBattleIdForUser").mockResolvedValueOnce({
      snapshotId: `snapshot-${crypto.randomUUID()}`,
      userId: "anonymous",
      battleId,
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [],
      savedAt: new Date().toISOString(),
    });
    const response = await GET(
      new Request(`http://localhost/api/battle/outcome?battleId=${encodeURIComponent(battleId)}`),
    );

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string };
      report: { report: string };
      reportSource: "gemini" | "fallback";
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe(battleId);
    expect(data.report.report).toContain("BTC");
    expect(data.reportSource).toBe("fallback");
  });

  it("settlement 모드는 report 없이 outcome seed를 먼저 반환한다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;
    const response = await POST(createOutcomeRequest({ battleId, mode: "settlement" }));

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string };
      report: null;
      reportPending: boolean;
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe(battleId);
    expect(data.report).toBeNull();
    expect(data.reportPending).toBe(true);

    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotByBattleIdForUser").mockResolvedValueOnce({
      snapshotId: `snapshot-${crypto.randomUUID()}`,
      userId: "anonymous",
      battleId,
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [],
      savedAt: new Date().toISOString(),
    });

    const getResponse = await GET(
      new Request(`http://localhost/api/battle/outcome?battleId=${encodeURIComponent(battleId)}`),
    );

    const getData = (await getResponse.json()) as {
      ok: boolean;
      report: null;
      reportPending: boolean;
    };

    expect(getData.ok).toBe(true);
    expect(getData.report).toBeNull();
    expect(getData.reportPending).toBe(true);
  });

  it("다른 owner가 같은 battleId 결과를 조회하면 404를 반환한다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;
    await POST(createOutcomeRequest({ battleId }));

    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "another-owner",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });

    const response = await GET(
      new Request(`http://localhost/api/battle/outcome?battleId=${encodeURIComponent(battleId)}`),
    );
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("같은 battleId로 다시 저장하면 recovered 응답을 준다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;

    await POST(createOutcomeRequest({ battleId }));
    const secondResponse = await POST(createOutcomeRequest({ battleId }));

    const data = (await secondResponse.json()) as {
      ok: boolean;
      recovered?: boolean;
    };

    expect(data.ok).toBe(true);
    expect(data.recovered).toBe(true);
  });

  it("messages가 없어도 snapshotId가 있으면 서버 snapshot으로 결과를 만든다", async () => {
    const snapshotId = `snapshot-${crypto.randomUUID()}`;
    const battleId = `battle-${crypto.randomUUID()}`;

    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotForUser").mockResolvedValueOnce({
      snapshotId,
      userId: "anonymous",
      battleId,
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [
        {
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "강한 상승 모멘텀이 이어지고 있어.",
          detail: "detail",
          indicatorLabel: "RSI",
          indicatorValue: "61",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      savedAt: new Date().toISOString(),
    });

    const response = await POST(
      new Request("http://localhost/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userBattle: {
            battleId,
            coinId: "bitcoin",
            coinSymbol: "BTC",
            selectedTeam: "bull",
            timeframe: "24h",
            selectedPrice: 84000,
            selectedAt: "2026-03-20T00:00:00.000Z",
            snapshotId,
            settlementAt: "2026-03-21T00:00:00.000Z",
            priceSource: "bybit-linear",
            marketSymbol: "BTCUSDT",
            settledPrice: null,
          },
        }),
      }),
    );

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string };
      characterMemorySeeds: Array<{ characterId: string }>;
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe(battleId);
    expect(data.characterMemorySeeds[0]?.characterId).toBe("aira");
  });

  it("영문 요약이 들어와도 저장 전에 한국어 fallback으로 정리한다", async () => {
    const response = await POST(
      createOutcomeRequest({
        battleId: `battle-${crypto.randomUUID()}`,
        summary: "Despite recent gains, BTC remains exposed to a sharp pullback.",
      }),
    );

    const data = (await response.json()) as {
      battleOutcomeSeed: { strongestWinningArgument: string };
      characterMemorySeeds: Array<{ summary: string }>;
      report: { report: string };
    };

    expect(data.battleOutcomeSeed.strongestWinningArgument).toContain("불리시");
    expect(data.characterMemorySeeds[0]?.summary).toContain("Aira");
    expect(data.report.report).not.toContain("Despite recent gains");
  });

  it("snapshot의 battleId가 요청 battleId와 다르면 409를 반환한다", async () => {
    const snapshotId = `snapshot-${crypto.randomUUID()}`;

    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotForUser").mockResolvedValueOnce({
      snapshotId,
      userId: "anonymous",
      battleId: "battle-original",
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [
        {
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "강한 상승 모멘텀이 이어지고 있어.",
          detail: "detail",
          indicatorLabel: "RSI",
          indicatorValue: "61",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      savedAt: new Date().toISOString(),
    });

    const response = await POST(
      new Request("http://localhost/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userBattle: {
            battleId: "battle-other",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            selectedTeam: "bull",
            timeframe: "24h",
            selectedPrice: 84000,
            selectedAt: "2026-03-20T00:00:00.000Z",
            snapshotId,
            settlementAt: "2026-03-21T00:00:00.000Z",
            priceSource: "bybit-linear",
            marketSymbol: "BTCUSDT",
            settledPrice: null,
          },
        }),
      }),
    );

    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(409);
    expect(data.error).toBe("snapshot_battle_mismatch");
  });

  it("짧은 시간 안에 너무 많이 저장 요청하면 429를 반환한다", async () => {
    vi.spyOn(requestRateLimiter, "consumeRequestRateLimit").mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
    });

    const blocked = await POST(createOutcomeRequest({ battleId: "battle-rate-blocked" }));
    const data = (await blocked.json()) as { error: string };

    expect(blocked.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
  }, 15_000);
});
