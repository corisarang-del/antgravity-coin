import { renderHook } from "@testing-library/react";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { storageKeys } from "@/shared/constants/storageKeys";

describe("useBattleSnapshot", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("coinId가 다르면 snapshot을 폐기한다", () => {
    window.localStorage.setItem(
      storageKeys.battleSnapshot,
      JSON.stringify({
        version: 1,
        coinId: "ethereum",
        marketData: null,
        summary: null,
        messages: [],
        savedAt: new Date().toISOString(),
      }),
    );

    const { result } = renderHook(() => useBattleSnapshot("bitcoin"));

    expect(result.current).toBeNull();
    expect(window.localStorage.getItem(storageKeys.battleSnapshot)).toBeNull();
  });

  it("TTL이 지난 snapshot을 폐기한다", () => {
    window.localStorage.setItem(
      storageKeys.battleSnapshot,
      JSON.stringify({
        version: 1,
        coinId: "bitcoin",
        marketData: null,
        summary: null,
        messages: [],
        savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
      }),
    );

    const { result } = renderHook(() => useBattleSnapshot("bitcoin"));

    expect(result.current).toBeNull();
    expect(window.localStorage.getItem(storageKeys.battleSnapshot)).toBeNull();
  });
});
