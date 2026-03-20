import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/cache/prewarm/route";

vi.mock("@/application/useCases/prewarmMarketCache", () => ({
  prewarmMarketCache: vi.fn().mockResolvedValue([
    { coinId: "bitcoin", ok: true, symbol: "BTC", prepared: true },
  ]),
}));

describe("POST /api/admin/cache/prewarm", () => {
  it("기본 prewarm 코인 목록으로 준비 컨텍스트까지 생성한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/cache/prewarm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    const data = (await response.json()) as {
      ok: boolean;
      coinIds: string[];
      results: Array<{ coinId: string; ok: boolean; prepared: boolean }>;
    };

    expect(data.ok).toBe(true);
    expect(data.coinIds.length).toBeGreaterThan(0);
    expect(data.results[0]?.coinId).toBe("bitcoin");
    expect(data.results[0]?.prepared).toBe(true);
  });
});
