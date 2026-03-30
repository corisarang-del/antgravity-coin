import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResultPageClient } from "@/app/battle/[coinId]/result/ResultPageClient";
import { getBattleSettlementAt } from "@/application/useCases/fetchBattleSettlement";

const battleSnapshotState = {
  messages: Array.from({ length: 8 }, (_, index) => ({
    id: `message-${index}`,
    characterId: `character-${index}`,
    characterName: `Character ${index}`,
    team: index % 2 === 0 ? "bull" : "bear",
    stance: index % 2 === 0 ? "bullish" : "bearish",
    summary: `summary-${index}`,
    detail: `detail-${index}`,
    indicatorLabel: "RSI",
    indicatorValue: "61",
    provider: "openrouter",
    model: "qwen/qwen3.5-9b",
    fallbackUsed: false,
    createdAt: new Date().toISOString(),
  })),
};

const currentUserState = {
  user: {
    userId: "user-1",
    email: "user@example.com",
    name: "tester",
    image: "",
    providerHints: [],
  },
  isLoading: false,
};

const userLevelStoreState = {
  userLevel: {
    level: 1,
    title: "개미",
    xp: 0,
    wins: 0,
    losses: 0,
  },
  hydrated: true,
  hydratedUserId: "user-1",
  hydrateUserLevel: vi.fn(),
  setUserLevel: vi.fn(),
};

let userBattleState: {
  userBattle: {
    battleId: string;
    coinId: string;
    coinSymbol: string;
    selectedTeam: "bull" | "bear";
    timeframe: "24h";
    selectedPrice: number;
    selectedAt: string;
    snapshotId: string | null;
    settlementAt: string;
    priceSource: "bybit-linear";
    marketSymbol: string;
    settledPrice: number | null;
  } | null;
};

vi.mock("@/presentation/hooks/useBattleSnapshot", () => ({
  useBattleSnapshot: () => battleSnapshotState,
}));

vi.mock("@/presentation/hooks/useCurrentUser", () => ({
  useCurrentUser: () => currentUserState,
}));

vi.mock("@/presentation/hooks/useUserBattle", () => ({
  useUserBattle: () => userBattleState,
}));

vi.mock("@/presentation/stores/userLevelStore", () => ({
  useUserLevelStore: () => userLevelStoreState,
}));

vi.mock("@/presentation/components/CountdownTimer", () => ({
  CountdownTimer: ({ label, seconds }: { label: string; seconds: number }) => (
    <div>{`${label}:${seconds}`}</div>
  ),
}));

vi.mock("@/presentation/components/MyPickSummary", () => ({
  MyPickSummary: () => <div>MyPickSummary</div>,
}));

vi.mock("@/presentation/components/RiskDisclaimer", () => ({
  RiskDisclaimer: () => <div>RiskDisclaimer</div>,
}));

vi.mock("@/presentation/components/UserLevelChange", () => ({
  UserLevelChange: () => <div>UserLevelChange</div>,
}));

vi.mock("@/presentation/components/CharacterLevelChange", () => ({
  CharacterLevelChange: () => <div>CharacterLevelChange</div>,
}));

vi.mock("@/presentation/components/VerdictBanner", () => ({
  VerdictBanner: () => <div>VerdictBanner</div>,
}));

vi.mock("@/presentation/components/WinnerHighlight", () => ({
  WinnerHighlight: () => <div>WinnerHighlight</div>,
}));

describe("ResultPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const selectedAt = "2026-03-28T00:00:00.000Z";
    userBattleState = {
      userBattle: {
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt,
        snapshotId: "snapshot-1",
        settlementAt: getBattleSettlementAt(selectedAt, "24h"),
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("pending 상태에서 전체 진행 바와 단계별 바를 함께 보여준다", () => {
    vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));

    render(<ResultPageClient coinId="bitcoin" />);

    expect(screen.getByText("결과 페이지 준비 중")).toBeInTheDocument();
    expect(screen.getByText("준비 진행도")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("약 43200초 남음")).toBeInTheDocument();
    expect(screen.getByText("실시간 정산까지 43200s")).toBeInTheDocument();
    expect(screen.getAllByText("곧 시작")).toHaveLength(2);
    expect(screen.getByText("현재까지 저장된 발언: 8/8")).toBeInTheDocument();
  });

  it("정산 단계에서는 resolveStage 기반 진행 바를 보여준다", async () => {
    vi.setSystemTime(new Date("2026-03-29T00:00:01.000Z"));
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "not_found" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "outcome_persist_failed" }),
        }),
    );

    render(<ResultPageClient coinId="bitcoin" />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("실캔들 조회 중")).toBeInTheDocument();
    expect(screen.getByText("정산 진행도")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("계산 중")).toBeInTheDocument();
  });
});
