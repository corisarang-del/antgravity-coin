import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchBybitEntryCandleClose,
  fetchBybitLongShortRatio,
  fetchBybitSettlementCandleClose,
  mapBattleTimeframeToBybitInterval,
} from "@/infrastructure/api/bybitClient";

describe("bybitClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("실제 응답 shape에서 롱숏 비율을 계산한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            list: [
              {
                buyRatio: "0.56",
                sellRatio: "0.44",
              },
            ],
          },
        }),
      }),
    );

    const result = await fetchBybitLongShortRatio("BTC");

    expect(result).toBe(1.27);
  });

  it("타임프레임을 Bybit interval로 바꾼다", () => {
    expect(mapBattleTimeframeToBybitInterval("5m")).toBe("5");
    expect(mapBattleTimeframeToBybitInterval("24h")).toBe("D");
    expect(mapBattleTimeframeToBybitInterval("7d")).toBe("W");
  });

  it("진입 가격은 선택 시점 직후 가장 가까운 1분봉 종가를 고른다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            list: [
              ["1710000060000", "100", "102", "99", "101", "10", "1000"],
              ["1710000000000", "99", "101", "98", "100", "12", "1100"],
            ],
          },
        }),
      }),
    );

    const candle = await fetchBybitEntryCandleClose("BTCUSDT", "2024-03-09T16:00:30.000Z");

    expect(candle.closePrice).toBe(100);
  });

  it("정산 가격은 settlementAt가 포함된 캔들 종가를 고른다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            list: [
              ["1710001800000", "101", "103", "100", "102", "15", "1500"],
              ["1710000000000", "99", "104", "98", "103", "20", "2000"],
            ],
          },
        }),
      }),
    );

    const candle = await fetchBybitSettlementCandleClose(
      "BTCUSDT",
      "4h",
      "2024-03-09T17:00:00.000Z",
    );

    expect(candle.closePrice).toBe(103);
  });
});
