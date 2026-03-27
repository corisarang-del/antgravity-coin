import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/battle/applications/route";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { clearRequestRateLimitStore } from "@/shared/utils/requestRateLimiter";
import * as requestRateLimiter from "@/shared/utils/requestRateLimiter";

vi.mock("@/infrastructure/auth/requestOwner", () => ({
  getRequestOwnerId: vi.fn().mockResolvedValue({
    ownerId: "anonymous",
    isAuthenticated: false,
    user: null,
    supabase: {} as never,
  }),
}));

describe("/api/battle/applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRequestRateLimitStore();
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "anonymous",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });
  });

  it("적용 여부를 owner 기준으로 조회한다", async () => {
    const battleId = `battle-${crypto.randomUUID()}`;

    const postResponse = await POST(
      new Request("http://localhost/api/battle/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleId }),
      }),
    );
    const postData = (await postResponse.json()) as { ok: boolean; userId: string };

    expect(postData.ok).toBe(true);
    expect(postData.userId).toBe("anonymous");

    const getResponse = await GET(
      new Request(`http://localhost/api/battle/applications?battleId=${battleId}`),
    );
    const getData = (await getResponse.json()) as { applied: boolean; userId: string };

    expect(getData.applied).toBe(true);
    expect(getData.userId).toBe("anonymous");
  });

  it("짧은 시간에 너무 많이 적용 요청하면 429를 반환한다", async () => {
    vi.spyOn(requestRateLimiter, "consumeSharedRequestRateLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(
      new Request("http://localhost/api/battle/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleId: `battle-${crypto.randomUUID()}` }),
      }),
    );
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  it("일일 quota를 넘기면 429를 반환한다", async () => {
    vi.spyOn(requestRateLimiter, "consumeSharedRequestRateLimit")
      .mockResolvedValueOnce({
        allowed: true,
        remaining: 19,
        retryAfterSeconds: 60,
        resetAt: Date.now() + 60_000,
      })
      .mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60 * 60 * 12,
        resetAt: Date.now() + 60 * 60 * 12 * 1000,
      });

    const response = await POST(
      new Request("http://localhost/api/battle/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleId: `battle-${crypto.randomUUID()}` }),
      }),
    );
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(429);
    expect(data.error).toBe("daily_quota_exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
