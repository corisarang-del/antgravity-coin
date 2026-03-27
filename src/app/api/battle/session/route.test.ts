import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/battle/session/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { persistAuthenticatedBattleSession } from "@/infrastructure/db/supabaseBattlePersistence";

const getSnapshotForUserMock = vi.fn();

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/infrastructure/db/supabaseBattlePersistence", () => ({
  persistAuthenticatedBattleSession: vi.fn(),
}));

vi.mock("@/infrastructure/db/fileBattleSnapshotRepository", () => ({
  FileBattleSnapshotRepository: vi.fn().mockImplementation(() => ({
    getSnapshotForUser: getSnapshotForUserMock,
  })),
}));

describe("POST /api/battle/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSnapshotForUserMock.mockResolvedValue({
      snapshotId: "snapshot-1",
      userId: "user-1",
      battleId: "battle-1",
      coinId: "bitcoin",
      marketData: {
        symbol: "BTC",
        currentPrice: 84000,
      },
      summary: null,
      messages: [],
      savedAt: "2026-03-20T00:00:00.000Z",
    });
  });

  function createRequest(overrides?: Record<string, unknown>) {
    return new Request("http://localhost/api/battle/session", {
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
          ...overrides,
        },
      }),
    });
  }

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

  it("비로그인 사용자는 401을 반환한다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    } as never);

    const response = await POST(createRequest());
    expect(response.status).toBe(401);
    expect(persistAuthenticatedBattleSession).not.toHaveBeenCalled();
  });

  it("snapshot이 없으면 저장하지 않는다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
    } as never);
    getSnapshotForUserMock.mockResolvedValueOnce(null);

    const response = await POST(createRequest());
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(data.error).toBe("snapshot_not_found");
    expect(persistAuthenticatedBattleSession).not.toHaveBeenCalled();
  });

  it("snapshot과 안 맞는 값이면 409를 반환한다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
    } as never);

    const response = await POST(createRequest({ selectedPrice: 85000 }));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(409);
    expect(data.error).toBe("user_battle_integrity_mismatch");
    expect(persistAuthenticatedBattleSession).not.toHaveBeenCalled();
  });

  it("검증된 userBattle만 저장한다", async () => {
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

    const response = await POST(createRequest());
    const data = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(persistAuthenticatedBattleSession).toHaveBeenCalledWith(
      supabase,
      { id: "user-1" },
      expect.objectContaining({
        battleId: "battle-1",
        snapshotId: "snapshot-1",
        coinSymbol: "BTC",
        selectedPrice: 84000,
        marketSymbol: "BTCUSDT",
      }),
    );
  });
});
