import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/battle/events/route";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
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

describe("GET /api/battle/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRequestRateLimitStore();
  });

  it("owner가 가진 battleId 기준 이벤트 목록을 반환한다", async () => {
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "anonymous",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });
    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotByBattleIdForUser").mockResolvedValueOnce({
      snapshotId: "snapshot-1",
      userId: "anonymous",
      battleId: "unknown",
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [],
      savedAt: new Date().toISOString(),
    });

    const response = await GET(new Request("http://localhost/api/battle/events?battleId=unknown"));
    const data = (await response.json()) as { ok: boolean; events: unknown[] };

    expect(data.ok).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
  });

  it("owner가 아닌 battleId 조회는 404를 반환한다", async () => {
    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshotByBattleIdForUser").mockResolvedValueOnce(
      null as unknown as Awaited<
        ReturnType<FileBattleSnapshotRepository["getSnapshotByBattleIdForUser"]>
      >,
    );

    const response = await GET(new Request("http://localhost/api/battle/events?battleId=unknown"));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("짧은 시간에 너무 많이 조회하면 429를 반환한다", async () => {
    vi.spyOn(requestRateLimiter, "consumeSharedRequestRateLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
    });

    const response = await GET(new Request("http://localhost/api/battle/events?battleId=unknown"));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
