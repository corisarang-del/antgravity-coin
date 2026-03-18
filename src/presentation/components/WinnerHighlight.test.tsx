import { render, screen } from "@testing-library/react";
import { WinnerHighlight } from "@/presentation/components/WinnerHighlight";

describe("WinnerHighlight", () => {
  it("승리 팀 메시지 중 정보 밀도가 높은 메시지를 우선 노출한다", () => {
    render(
      <WinnerHighlight
        messages={[
          {
            id: "1",
            characterId: "aira",
            characterName: "Aira",
            team: "bull",
            stance: "bullish",
            summary: "짧은 주장",
            detail: "짧다",
            indicatorLabel: "",
            indicatorValue: "",
            provider: "openrouter",
            model: "qwen/qwen3.5-9b",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            characterId: "judy",
            characterName: "Judy",
            team: "bull",
            stance: "bullish",
            summary: "뉴스와 거래량이 같이 받쳐줘서 상승 논리가 더 선명해.",
            detail: "핵심 지표와 주장 포인트가 같이 보여서 대표 발언으로 쓰기 좋다.",
            indicatorLabel: "RSI",
            indicatorValue: "61.2",
            provider: "openrouter",
            model: "minimax/minimax-m2.5:free",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            characterId: "shade",
            characterName: "Shade",
            team: "bear",
            stance: "bearish",
            summary: "하락 쪽이야",
            detail: "bear detail",
            indicatorLabel: "리스크",
            indicatorValue: "높음",
            provider: "openrouter",
            model: "stepfun/step-3.5-flash:free",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
        ]}
        winningTeam="bull"
      />,
    );

    const cards = screen.getAllByText(/Aira|Judy/);
    expect(cards[0]).toHaveTextContent("Judy");
  });
});
