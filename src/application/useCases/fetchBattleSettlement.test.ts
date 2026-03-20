import { describe, expect, it, vi } from "vitest";
import {
  fetchBattleSettlement,
  getBattleSettlementAt,
  isBattleSettlementReady,
} from "@/application/useCases/fetchBattleSettlement";
import * as bybitClient from "@/infrastructure/api/bybitClient";

describe("fetchBattleSettlement", () => {
  it("타임프레임 기준으로 settlementAt을 계산한다", () => {
    expect(getBattleSettlementAt("2026-03-20T00:00:00.000Z", "5m")).toBe("2026-03-20T00:05:00.000Z");
    expect(getBattleSettlementAt("2026-03-20T00:00:00.000Z", "7d")).toBe("2026-03-27T00:00:00.000Z");
  });

  it("정산 시각 전이면 pending 상태를 반환한다", async () => {
    const result = await fetchBattleSettlement(
      {
        battleId: crypto.randomUUID(),
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "30m",
        selectedPrice: 84000,
        selectedAt: "2026-03-20T00:00:00.000Z",
        snapshotId: "snapshot-1",
        settlementAt: "2026-03-20T00:30:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
      new Date("2026-03-20T00:10:00.000Z"),
    );

    expect(result.status).toBe("pending");
    expect(result.settledPrice).toBeNull();
  });

  it("정산 시각이 지나면 실캔들 기준 결과를 계산한다", async () => {
    vi.spyOn(bybitClient, "fetchBybitEntryCandleClose").mockResolvedValue({
      startTimeMs: 1,
      endTimeMs: 2,
      openPrice: 100,
      highPrice: 101,
      lowPrice: 99,
      closePrice: 100,
      volume: 10,
      turnover: 1000,
    });
    vi.spyOn(bybitClient, "fetchBybitSettlementCandleClose").mockResolvedValue({
      startTimeMs: 3,
      endTimeMs: 4,
      openPrice: 100,
      highPrice: 103,
      lowPrice: 99,
      closePrice: 102,
      volume: 12,
      turnover: 1200,
    });

    const result = await fetchBattleSettlement(
      {
        battleId: crypto.randomUUID(),
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "5m",
        selectedPrice: 84000,
        selectedAt: "2026-03-20T00:00:00.000Z",
        snapshotId: "snapshot-1",
        settlementAt: "2026-03-20T00:05:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
      new Date("2026-03-20T00:06:00.000Z"),
    );

    expect(result.status).toBe("settled");
    expect(result.settledPrice).toBe(102);
    expect(result.priceChangePercent).toBe(2);
    expect(result.winningTeam).toBe("bull");
  });

  it("현재 시각으로 정산 가능 여부를 판단한다", () => {
    expect(
      isBattleSettlementReady(
        {
          battleId: crypto.randomUUID(),
          coinId: "bitcoin",
          coinSymbol: "BTC",
          selectedTeam: "bull",
          timeframe: "5m",
          selectedPrice: 84000,
          selectedAt: "2026-03-20T00:00:00.000Z",
          snapshotId: "snapshot-1",
          settlementAt: "2026-03-20T00:05:00.000Z",
          priceSource: "bybit-linear",
          marketSymbol: "BTCUSDT",
          settledPrice: null,
        },
        new Date("2026-03-20T00:06:00.000Z"),
      ),
    ).toBe(true);
  });
});
