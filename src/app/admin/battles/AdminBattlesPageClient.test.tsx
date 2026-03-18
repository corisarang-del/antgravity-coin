import { render, screen } from "@testing-library/react";
import { AdminBattlesPageClient } from "@/app/admin/battles/AdminBattlesPageClient";

describe("AdminBattlesPageClient", () => {
  it("최근 배틀과 상세 정보를 렌더링한다", () => {
    render(
      <AdminBattlesPageClient
        initialBattleId="battle-1"
        initialBattles={[
          {
            battleId: "battle-1",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            timeframe: "24h",
            winningTeam: "bull",
            priceChangePercent: 2.4,
            userWon: true,
            ruleVersion: "v1",
            createdAt: new Date().toISOString(),
            hasReport: true,
            reportSource: "fallback",
          },
        ]}
        initialDetail={{
          battleOutcomeSeed: {
            battleId: "battle-1",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            timeframe: "24h",
            winningTeam: "bull",
            priceChangePercent: 2.4,
            userSelectedTeam: "bull",
            userWon: true,
            strongestWinningArgument: "상승 논리",
            weakestLosingArgument: "하락 논리",
            ruleVersion: "v1",
            createdAt: new Date().toISOString(),
          },
          characterMemorySeeds: [],
          playerDecisionSeed: {
            selectedTeam: "bull",
            selectedPrice: 84000,
          },
          report: {
            report: "BTC 24h 배틀 회고",
          },
          reportSource: "fallback",
          events: [],
        }}
      />,
    );

    expect(screen.getByText("운영자 배틀 대시보드")).toBeInTheDocument();
    expect(screen.getByText("BTC 24h 배틀 회고")).toBeInTheDocument();
    expect(screen.getByText(/report source: fallback/i)).toBeInTheDocument();
  });
});
