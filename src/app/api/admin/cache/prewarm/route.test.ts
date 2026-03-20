import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/cache/prewarm/route";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { clearRequestRateLimitStore } from "@/shared/utils/requestRateLimiter";

vi.mock("@/application/useCases/prewarmMarketCache", () => ({
  prewarmMarketCache: vi.fn().mockResolvedValue([
    { coinId: "bitcoin", ok: true, symbol: "BTC", prepared: true },
  ]),
}));

vi.mock("@/infrastructure/auth/requestOwner", () => ({
  getRequestOwnerId: vi.fn().mockResolvedValue({
    ownerId: "anonymous",
    isAuthenticated: false,
    user: null,
    supabase: {} as never,
  }),
}));

describe("POST /api/admin/cache/prewarm", () => {
  it("기본 prewarm 코인 목록으로 준비 컨텍스트까지 생성한다", async () => {
    clearRequestRateLimitStore();
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "anonymous",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });
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

  it("짧은 시간 안에 반복 호출하면 429를 반환한다", async () => {
    clearRequestRateLimitStore();
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "anonymous",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });

    for (let index = 0; index < 2; index += 1) {
      const response = await POST(
        new Request("http://localhost/api/admin/cache/prewarm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }),
      );

      expect(response.status).toBe(200);
    }

    const blocked = await POST(
      new Request("http://localhost/api/admin/cache/prewarm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );
    const data = (await blocked.json()) as { error: string };

    expect(blocked.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
  });
});
