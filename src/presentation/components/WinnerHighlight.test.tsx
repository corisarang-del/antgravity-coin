import { render, screen } from "@testing-library/react";
import { WinnerHighlight } from "@/presentation/components/WinnerHighlight";

describe("WinnerHighlight", () => {
  it("같은 캐릭터가 여러 메시지를 남겨도 가장 점수 높은 메시지를 사용해", () => {
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
            id: "1-2",
            characterId: "aira",
            characterName: "Aira",
            team: "bull",
            stance: "bullish",
            summary: "Aira가 더 긴 요약과 지표로 다시 주장",
            detail: "상세 설명도 더 길고 지표 근거도 명확해서 점수가 더 높아야 해.",
            indicatorLabel: "MACD",
            indicatorValue: "1.2",
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
            summary: "뉴스와 거래대금이 같이 받쳐줘서 강세 논리가 더 선명해.",
            detail: "추가 지표와 뉴스 흐름이 함께 보여서 상위 카드에 들어가야 해.",
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
            summary: "하락 쪽 주장",
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

    expect(screen.getByText("Aira")).toBeInTheDocument();
    expect(screen.getByText("Judy")).toBeInTheDocument();
    expect(screen.getByText("Aira가 더 긴 요약과 지표로 다시 주장")).toBeInTheDocument();
    expect(screen.queryByText("짧은 주장")).not.toBeInTheDocument();
  });
});
