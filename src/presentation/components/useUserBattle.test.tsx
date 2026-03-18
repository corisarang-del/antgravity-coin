import { act, renderHook } from "@testing-library/react";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { storageKeys } from "@/shared/constants/storageKeys";

describe("useUserBattle", () => {
  it("팀 선택 후 로컬스토리지에 userBattle을 저장한다", () => {
    const { result } = renderHook(() => useUserBattle());

    act(() => {
      result.current.saveUserBattle({
        battleId: crypto.randomUUID(),
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt: new Date().toISOString(),
      });
    });

    expect(window.localStorage.getItem(storageKeys.userBattle)).toContain('"coinId":"bitcoin"');
  });
});
