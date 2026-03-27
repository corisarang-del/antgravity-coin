import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/coins/search/route";
import { searchCoins } from "@/application/useCases/searchCoins";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import * as requestRateLimiter from "@/shared/utils/requestRateLimiter";

vi.mock("@/application/useCases/searchCoins", () => ({
  searchCoins: vi.fn(),
}));

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    rpc: vi.fn(),
  }),
}));

describe("GET /api/coins/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(searchCoins).mockResolvedValue([]);
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc: vi.fn(),
    } as never);
  });

  it("빈 검색어는 바로 빈 목록을 반환한다", async () => {
    const response = await GET(new Request("http://localhost/api/coins/search?q="));
    const data = (await response.json()) as { coins: unknown[] };

    expect(response.status).toBe(200);
    expect(data.coins).toEqual([]);
    expect(searchCoins).not.toHaveBeenCalled();
  });

  it("검색어가 너무 길면 400을 반환한다", async () => {
    const response = await GET(
      new Request(`http://localhost/api/coins/search?q=${"a".repeat(65)}`),
    );
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(data.error).toBe("invalid_query");
    expect(searchCoins).not.toHaveBeenCalled();
  });

  it("rate limit을 넘기면 429를 반환한다", async () => {
    vi.spyOn(requestRateLimiter, "consumeSharedRequestRateLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
    });

    const response = await GET(new Request("http://localhost/api/coins/search?q=btc"));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
