import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/battle/session/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { persistAuthenticatedBattleSession } from "@/infrastructure/db/supabaseBattlePersistence";

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/infrastructure/db/supabaseBattlePersistence", () => ({
  persistAuthenticatedBattleSession: vi.fn(),
}));

describe("POST /api/battle/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("userBattle가 없으면 400을 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/battle/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("비로그인 사용자는 저장을 건너뛴다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    } as never);

    const response = await POST(
      new Request("http://localhost/api/battle/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userBattle: {
            battleId: "battle-1",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            selectedTeam: "bull",
            timeframe: "24h",
            selectedPrice: 84000,
            selectedAt: "2026-03-20T00:00:00.000Z",
            snapshotId: "snapshot-1",
            settlementAt: "2026-03-21T00:00:00.000Z",
            priceSource: "bybit-linear",
            marketSymbol: "BTCUSDT",
            settledPrice: null,
          },
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; skipped: string };

    expect(data.ok).toBe(false);
    expect(data.skipped).toBe("unauthenticated");
    expect(persistAuthenticatedBattleSession).not.toHaveBeenCalled();
  });

  it("로그인 사용자는 Supabase session 저장을 호출한다", async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(supabase as never);

    const response = await POST(
      new Request("http://localhost/api/battle/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userBattle: {
            battleId: "battle-1",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            selectedTeam: "bull",
            timeframe: "24h",
            selectedPrice: 84000,
            selectedAt: "2026-03-20T00:00:00.000Z",
            snapshotId: "snapshot-1",
            settlementAt: "2026-03-21T00:00:00.000Z",
            priceSource: "bybit-linear",
            marketSymbol: "BTCUSDT",
            settledPrice: null,
          },
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean };

    expect(data.ok).toBe(true);
    expect(persistAuthenticatedBattleSession).toHaveBeenCalledTimes(1);
    expect(persistAuthenticatedBattleSession).toHaveBeenCalledWith(
      supabase,
      { id: "user-1" },
      expect.objectContaining({ battleId: "battle-1", snapshotId: "snapshot-1" }),
    );
  });
});
