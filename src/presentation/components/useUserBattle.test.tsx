import { act, renderHook } from "@testing-library/react";
import { getBattleSettlementAt } from "@/application/useCases/fetchBattleSettlement";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { storageKeys } from "@/shared/constants/storageKeys";

function createUserBattle(overrides?: Partial<ReturnType<typeof buildUserBattle>>) {
  return {
    ...buildUserBattle(),
    ...overrides,
  };
}

function buildUserBattle() {
  const selectedAt = new Date().toISOString();

  return {
    battleId: crypto.randomUUID(),
    coinId: "bitcoin",
    coinSymbol: "BTC",
    selectedTeam: "bull" as const,
    timeframe: "24h" as const,
    selectedPrice: 84000,
    selectedAt,
    snapshotId: "snapshot-1",
    settlementAt: getBattleSettlementAt(selectedAt, "24h"),
    priceSource: "bybit-linear" as const,
    marketSymbol: "BTCUSDT",
    settledPrice: null,
  };
}

describe("useUserBattle", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("선택 정보를 localStorage에 저장한다", () => {
    const { result } = renderHook(() => useUserBattle());

    act(() => {
      result.current.saveUserBattle(createUserBattle());
    });

    expect(window.localStorage.getItem(storageKeys.userBattle)).toContain('"coinId":"bitcoin"');
  });

  it("coinId가 다르면 저장된 userBattle을 폐기한다", () => {
    window.localStorage.setItem(
      storageKeys.userBattle,
      JSON.stringify(createUserBattle({ coinId: "ethereum", coinSymbol: "ETH", marketSymbol: "ETHUSDT" })),
    );

    const { result } = renderHook(() => useUserBattle("bitcoin"));

    expect(result.current.userBattle).toBeNull();
    expect(window.localStorage.getItem(storageKeys.userBattle)).toBeNull();
  });

  it("TTL이 지난 userBattle을 폐기한다", () => {
    window.localStorage.setItem(
      storageKeys.userBattle,
      JSON.stringify(
        createUserBattle({
          selectedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          settlementAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        }),
      ),
    );

    const { result } = renderHook(() => useUserBattle("bitcoin"));

    expect(result.current.userBattle).toBeNull();
    expect(window.localStorage.getItem(storageKeys.userBattle)).toBeNull();
  });
});
