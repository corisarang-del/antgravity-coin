import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/cache/prewarm/route";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";
import { clearRequestRateLimitStore } from "@/shared/utils/requestRateLimiter";

vi.mock("@/application/useCases/prewarmMarketCache", () => ({
  prewarmMarketCache: vi.fn().mockResolvedValue([
    { coinId: "bitcoin", ok: true, symbol: "BTC", prepared: true },
  ]),
}));

vi.mock("@/infrastructure/auth/adminAccess", () => ({
  getAdminAccess: vi.fn().mockResolvedValue({
    allowed: true,
    status: 200,
    user: { id: "admin-user" },
    supabase: {} as never,
  }),
}));

describe("POST /api/admin/cache/prewarm", () => {
  it("관리자 권한이 없으면 403을 반환한다", async () => {
    vi.mocked(getAdminAccess).mockResolvedValueOnce({
      allowed: false,
      status: 403,
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
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("관리자일 때 기본 prewarm 코인 목록으로 준비를 시작한다", async () => {
    clearRequestRateLimitStore();

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
