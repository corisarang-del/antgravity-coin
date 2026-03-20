import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/merge-local/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import {
  persistAuthenticatedBattleOutcome,
  persistAuthenticatedBattleSession,
  persistAuthenticatedBattleSnapshot,
} from "@/infrastructure/db/supabaseBattlePersistence";
import { getGuestUserId } from "@/infrastructure/auth/guestSession";

const listEventsMock = vi.fn();
const getSnapshotByBattleIdMock = vi.fn();
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
  persistAuthenticatedBattleSession: vi.fn(),
  persistAuthenticatedBattleSnapshot: vi.fn(),
}));

vi.mock("@/infrastructure/db/fileEventLog", () => ({
  FileEventLog: vi.fn().mockImplementation(() => ({
    list: listEventsMock,
  })),
}));

vi.mock("@/infrastructure/db/fileBattleSnapshotRepository", () => ({
  FileBattleSnapshotRepository: vi.fn().mockImplementation(() => ({
    getSnapshotByBattleId: getSnapshotByBattleIdMock,
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
    listEventsMock.mockResolvedValue([]);
    getSnapshotByBattleIdMock.mockResolvedValue(null);
    getBattleOutcomeSeedMock.mockResolvedValue(null);
    getPlayerDecisionSeedMock.mockResolvedValue(null);
    getCharacterMemorySeedsMock.mockResolvedValue([]);
    getReportByBattleIdMock.mockResolvedValue(null);
    vi.mocked(getGuestUserId).mockResolvedValue(null);
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

  it("현재 local battle/session/snapshot을 인증 사용자 쪽에 병합한다", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
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
      from: vi.fn().mockReturnValue({
        upsert: upsertMock,
      }),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(supabase as never);

    const response = await POST(
      new Request("http://localhost/api/auth/merge-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          localUserLevel: {
            level: 2,
            title: "개미",
            xp: 120,
            wins: 3,
            losses: 1,
          },
          recentCoins: ["bitcoin"],
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
          battleSnapshot: {
            snapshotId: "snapshot-1",
            coinId: "bitcoin",
            marketData: null,
            summary: null,
            messages: [],
          },
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; importedBattleIds: string[] };

    expect(data.ok).toBe(true);
    expect(persistAuthenticatedBattleSession).toHaveBeenCalledTimes(1);
    expect(persistAuthenticatedBattleSnapshot).toHaveBeenCalledTimes(1);
    expect(persistAuthenticatedBattleOutcome).not.toHaveBeenCalled();
  });

  it("guest battle 자산이 있으면 importedBattleIds에 포함해 계정으로 옮긴다", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
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
      from: vi.fn().mockReturnValue({
        upsert: upsertMock,
      }),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(supabase as never);
    vi.mocked(getGuestUserId).mockResolvedValue("guest-1");
    listEventsMock.mockResolvedValue([
      {
        battleId: "battle-guest",
        userId: "guest-1",
      },
    ]);
    getSnapshotByBattleIdMock.mockResolvedValue({
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
      coinId: "bitcoin",
      coinSymbol: "BTC",
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
        body: JSON.stringify({}),
      }),
    );

    const data = (await response.json()) as { ok: boolean; importedBattleIds: string[] };

    expect(data.ok).toBe(true);
    expect(data.importedBattleIds).toEqual(["battle-guest"]);
    expect(persistAuthenticatedBattleSnapshot).toHaveBeenCalled();
    expect(persistAuthenticatedBattleOutcome).toHaveBeenCalledTimes(1);
  });
});
