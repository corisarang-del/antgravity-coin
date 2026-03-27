import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/merge-local/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { persistAuthenticatedBattleOutcome } from "@/infrastructure/db/supabaseBattlePersistence";
import { getGuestUserId } from "@/infrastructure/auth/guestSession";

const upsertMock = vi.fn();
const listEventsMock = vi.fn();
const getSnapshotByBattleIdForUserMock = vi.fn();
const getBattleOutcomeSeedMock = vi.fn();
const getPlayerDecisionSeedMock = vi.fn();
const getCharacterMemorySeedsMock = vi.fn();
const getReportByBattleIdMock = vi.fn();

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/infrastructure/auth/guestSession", () => ({
  getGuestUserId: vi.fn(),
}));

vi.mock("@/infrastructure/db/supabaseBattlePersistence", () => ({
  persistAuthenticatedBattleOutcome: vi.fn(),
}));

vi.mock("@/infrastructure/db/fileEventLog", () => ({
  FileEventLog: vi.fn().mockImplementation(() => ({
    list: listEventsMock,
  })),
}));

vi.mock("@/infrastructure/db/fileBattleSnapshotRepository", () => ({
  FileBattleSnapshotRepository: vi.fn().mockImplementation(() => ({
    getSnapshotByBattleIdForUser: getSnapshotByBattleIdForUserMock,
  })),
}));

vi.mock("@/infrastructure/db/fileSeedRepository", () => ({
  FileSeedRepository: vi.fn().mockImplementation(() => ({
    getBattleOutcomeSeed: getBattleOutcomeSeedMock,
    getPlayerDecisionSeed: getPlayerDecisionSeedMock,
    getCharacterMemorySeeds: getCharacterMemorySeedsMock,
  })),
}));

vi.mock("@/infrastructure/db/fileReportRepository", () => ({
  FileReportRepository: vi.fn().mockImplementation(() => ({
    getByBattleId: getReportByBattleIdMock,
  })),
}));

describe("POST /api/auth/merge-local", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ data: null, error: null });
    listEventsMock.mockResolvedValue([]);
    getSnapshotByBattleIdForUserMock.mockResolvedValue(null);
    getBattleOutcomeSeedMock.mockResolvedValue(null);
    getPlayerDecisionSeedMock.mockResolvedValue(null);
    getCharacterMemorySeedsMock.mockResolvedValue([]);
    getReportByBattleIdMock.mockResolvedValue(null);
    vi.mocked(getGuestUserId).mockResolvedValue(null);
  });

  function createSupabaseMock() {
    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        upsert: upsertMock,
      }),
    };
  }

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

    const response = await POST(
      new Request("http://localhost/api/auth/merge-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("최근 코인만 정제해서 병합하고 클라이언트 진행도는 신뢰하지 않는다", async () => {
    const supabase = createSupabaseMock();
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(supabase as never);

    const response = await POST(
      new Request("http://localhost/api/auth/merge-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          localUserLevel: {
            level: 99,
            xp: 99999,
            wins: 999,
            losses: 0,
          },
          userBattle: {
            battleId: "battle-1",
          },
          battleSnapshot: {
            snapshotId: "snapshot-1",
          },
          recentCoins: ["bitcoin", "ETHEREUM", "../admin", "x".repeat(40)],
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; importedBattleIds: string[] };

    expect(data.ok).toBe(true);
    expect(data.importedBattleIds).toEqual([]);
    expect(supabase.from).toHaveBeenCalledWith("user_recent_coins");
    expect(upsertMock).toHaveBeenCalledWith([
      expect.objectContaining({ coin_id: "bitcoin" }),
      expect.objectContaining({ coin_id: "ethereum" }),
    ]);
    expect(persistAuthenticatedBattleOutcome).not.toHaveBeenCalled();
  });

  it("guest outcome은 서버에 저장된 데이터만 계정으로 옮긴다", async () => {
    const supabase = createSupabaseMock();
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(supabase as never);
    vi.mocked(getGuestUserId).mockResolvedValue("guest-1");
    listEventsMock.mockResolvedValue([
      {
        battleId: "battle-guest",
        userId: "guest-1",
      },
    ]);
    getSnapshotByBattleIdForUserMock.mockResolvedValue({
      snapshotId: "snapshot-guest",
      userId: "guest-1",
      battleId: "battle-guest",
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [],
      savedAt: "2026-03-20T00:00:00.000Z",
    });
    getBattleOutcomeSeedMock.mockResolvedValue({
      battleId: "battle-guest",
      coinId: "bitcoin",
      coinSymbol: "BTC",
      timeframe: "24h",
      settlementAt: "2026-03-21T00:00:00.000Z",
      priceSource: "bybit-linear",
      marketSymbol: "BTCUSDT",
      settledPrice: 86000,
      winningTeam: "bull",
      priceChangePercent: 2.38,
      userSelectedTeam: "bull",
      userWon: true,
      strongestWinningArgument: "불리시 주장",
      weakestLosingArgument: "베어리시 주장",
      ruleVersion: "v1",
      createdAt: "2026-03-20T00:00:00.000Z",
    });
    getPlayerDecisionSeedMock.mockResolvedValue({
      battleId: "battle-guest",
      selectedTeam: "bull",
      timeframe: "24h",
      selectedPrice: 84000,
      snapshotId: "snapshot-guest",
      settlementAt: "2026-03-21T00:00:00.000Z",
      priceSource: "bybit-linear",
      marketSymbol: "BTCUSDT",
      settledPrice: 86000,
      userWon: true,
      createdAt: "2026-03-20T00:00:00.000Z",
    });
    getCharacterMemorySeedsMock.mockResolvedValue([]);
    getReportByBattleIdMock.mockResolvedValue({
      id: "report-1",
      battleId: "battle-guest",
      outcomeSeedId: "outcome-1",
      report: "report",
      reportSource: "fallback",
      createdAt: "2026-03-20T00:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/merge-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recentCoins: [] }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; importedBattleIds: string[] };

    expect(data.ok).toBe(true);
    expect(data.importedBattleIds).toEqual(["battle-guest"]);
    expect(getSnapshotByBattleIdForUserMock).toHaveBeenCalledWith("battle-guest", "guest-1");
    expect(persistAuthenticatedBattleOutcome).toHaveBeenCalledTimes(1);
    expect(supabase.from).toHaveBeenCalledWith("battle_snapshots");
  });
});
